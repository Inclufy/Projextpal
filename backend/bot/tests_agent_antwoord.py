"""Legt vast wat de chatbot teruggeeft, los van welke LLM eronder zit.

Aanleiding: de upgrade naar langchain 1.x. Daar bestaan AgentExecutor en
create_openai_functions_agent niet meer, en het contract veranderde mee:

    vóór 1.x   invoke({"input": ..., "chat_history": ...})
               -> {"output": ..., "intermediate_steps": [(actie, uitvoer), ...]}

    1.x        invoke({"messages": [...]})
               -> {"messages": [..., ToolMessage, AIMessage]}

De tool-uitvoer waar de UI op leunt -- form_type / error / message / success --
zat vóór 1.x in intermediate_steps en zit nu in de ToolMessages. Dat is precies
het soort wijziging dat stil misgaat: de agent blijft antwoorden, maar de
formulieren verschijnen niet meer en niemand ziet een fout.

Deze tests draaien zonder OpenAI-sleutel en zonder netwerk: ze voeren een
verzonnen result in en controleren wat eruit komt. Ze toetsen het CONTRACT, niet
het model.
"""
import json

from django.test import SimpleTestCase
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage

from bot.agent_antwoord import _antwoord_uit_result, _naar_berichten


def _tool(inhoud):
    """ToolMessage zoals langchain 1.x hem maakt: content is een string."""
    return ToolMessage(
        content=inhoud if isinstance(inhoud, str) else json.dumps(inhoud),
        tool_call_id="x",
    )


class AntwoordUitResult(SimpleTestCase):
    def test_gewoon_antwoord_komt_uit_het_laatste_ai_bericht(self):
        result = {"messages": [HumanMessage(content="hoi"), AIMessage(content="Hallo!")]}
        self.assertEqual(_antwoord_uit_result(result), "Hallo!")

    def test_laatste_ai_bericht_wint_van_eerdere(self):
        result = {"messages": [AIMessage(content="eerst"), AIMessage(content="laatst")]}
        self.assertEqual(_antwoord_uit_result(result), "laatst")

    def test_form_type_wordt_json_zodat_de_ui_een_formulier_toont(self):
        # Dit is de belangrijkste: hierop leunt de formulier-weergave in de chat.
        payload = {"form_type": "create_project", "fields": ["naam", "startdatum"]}
        result = {"messages": [AIMessage(content=""), _tool(payload)]}
        uit = _antwoord_uit_result(result)
        self.assertEqual(json.loads(uit), payload)

    def test_error_komt_als_platte_tekst_terug(self):
        result = {"messages": [AIMessage(content=""), _tool({"error": "Geen toegang tot dit project"})]}
        self.assertEqual(_antwoord_uit_result(result), "Geen toegang tot dit project")

    def test_message_komt_als_platte_tekst_terug(self):
        result = {"messages": [AIMessage(content=""), _tool({"message": "Taak aangemaakt"})]}
        self.assertEqual(_antwoord_uit_result(result), "Taak aangemaakt")

    def test_success_wordt_json(self):
        payload = {"success": True, "id": 42}
        result = {"messages": [AIMessage(content=""), _tool(payload)]}
        self.assertEqual(json.loads(_antwoord_uit_result(result)), payload)

    def test_tekst_van_de_agent_gaat_voor_op_tool_uitvoer(self):
        # Zegt het model zelf iets, dan is dat het antwoord -- de tool-uitvoer is
        # dan al in dat antwoord verwerkt.
        result = {"messages": [_tool({"message": "rauw"}), AIMessage(content="Netjes verwoord")]}
        self.assertEqual(_antwoord_uit_result(result), "Netjes verwoord")

    def test_tool_uitvoer_die_geen_json_is_komt_ongewijzigd_terug(self):
        result = {"messages": [AIMessage(content=""), _tool("gewoon een zin")]}
        self.assertEqual(_antwoord_uit_result(result), "gewoon een zin")

    def test_leeg_result_geeft_lege_string_geen_uitzondering(self):
        # Een kapotte agent mag geen 500 veroorzaken in de chat.
        self.assertEqual(_antwoord_uit_result({}), "")
        self.assertEqual(_antwoord_uit_result({"messages": []}), "")
        self.assertEqual(_antwoord_uit_result(None), "")


class NaarBerichten(SimpleTestCase):
    def test_de_vraag_staat_altijd_als_laatste(self):
        b = _naar_berichten([], "wat is de status?")
        self.assertEqual(len(b), 1)
        self.assertIsInstance(b[-1], HumanMessage)
        self.assertEqual(b[-1].content, "wat is de status?")

    def test_rollen_worden_omgezet_naar_het_juiste_berichttype(self):
        b = _naar_berichten(
            [{"role": "user", "content": "hoi"}, {"role": "assistant", "content": "hallo"}],
            "en nu?",
        )
        self.assertIsInstance(b[0], HumanMessage)
        self.assertIsInstance(b[1], AIMessage)
        self.assertIsInstance(b[2], HumanMessage)

    def test_hoogstens_tien_uit_de_geschiedenis(self):
        # Zelfde grens als vóór de upgrade; anders groeit de prompt onbeperkt.
        lang = [{"role": "user", "content": str(i)} for i in range(30)]
        b = _naar_berichten(lang, "laatste")
        self.assertEqual(len(b), 11)          # 10 uit de geschiedenis + de vraag
        self.assertEqual(b[0].content, "20")  # de tien meest recente

    def test_lege_berichten_vallen_weg(self):
        b = _naar_berichten([{"role": "user", "content": ""}], "vraag")
        self.assertEqual(len(b), 1)

    def test_geen_geschiedenis_is_geen_fout(self):
        self.assertEqual(len(_naar_berichten(None, "vraag")), 1)
