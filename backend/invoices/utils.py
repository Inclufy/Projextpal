from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_CENTER
from io import BytesIO
from django.core.files.base import ContentFile
import os


class InvoicePDFGenerator:
    """
    Professional PDF invoice generator with multi-currency and VAT support
    """
    
    def __init__(self, invoice):
        self.invoice = invoice
        self.buffer = BytesIO()
        self.width, self.height = A4
        self.styles = getSampleStyleSheet()
        
        # Currency symbols
        self.currency_symbols = {
            'EUR': '€',
            'USD': '$',
            'GBP': '£',
        }
    
    def get_currency_symbol(self):
        """Get currency symbol for invoice"""
        return self.currency_symbols.get(self.invoice.currency, self.invoice.currency)
    
    def format_money(self, amount):
        """Format money with currency symbol"""
        symbol = self.get_currency_symbol()
        return f"{symbol}{amount:,.2f}"
    
    def generate(self):
        """Generate PDF and return file content"""
        # Create PDF document
        doc = SimpleDocTemplate(
            self.buffer,
            pagesize=A4,
            rightMargin=20*mm,
            leftMargin=20*mm,
            topMargin=20*mm,
            bottomMargin=20*mm
        )
        
        # Build content
        story = []
        
        # Header with logo
        story.extend(self._create_header())
        story.append(Spacer(1, 10*mm))
        
        # Invoice details
        story.extend(self._create_invoice_details())
        story.append(Spacer(1, 10*mm))
        
        # Customer & Company info
        story.extend(self._create_addresses())
        story.append(Spacer(1, 10*mm))
        
        # Line items table
        story.extend(self._create_items_table())
        story.append(Spacer(1, 10*mm))
        
        # Totals
        story.extend(self._create_totals())
        story.append(Spacer(1, 10*mm))
        
        # Payment info & footer
        story.extend(self._create_footer())
        
        # Build PDF
        doc.build(story)
        
        # Get PDF content
        pdf_content = self.buffer.getvalue()
        self.buffer.close()
        
        return pdf_content
    
    def _create_header(self):
        """Create invoice header with logo"""
        elements = []
        
        # Get invoice settings
        from invoices.models import InvoiceSettings
        try:
            settings = InvoiceSettings.objects.first()
        except:
            settings = None
        
        # Logo and company info table
        data = []
        
        if settings and settings.logo:
            try:
                logo = Image(settings.logo.path, width=40*mm, height=15*mm)
                logo.hAlign = 'LEFT'
                data.append([logo, ''])
            except:
                pass
        
        # Header table
        header_style = ParagraphStyle(
            'HeaderStyle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#6366f1'),
            alignment=TA_RIGHT
        )
        
        invoice_header = Paragraph(f"<b>INVOICE</b>", header_style)
        
        if not data:
            data.append(['', invoice_header])
        else:
            data[0][1] = invoice_header
        
        table = Table(data, colWidths=[90*mm, 80*mm])
        table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        elements.append(table)
        
        return elements
    
    def _create_invoice_details(self):
        """Create invoice number and dates"""
        elements = []
        
        detail_style = ParagraphStyle(
            'DetailStyle',
            parent=self.styles['Normal'],
            fontSize=10,
        )
        
        # Invoice details
        details_data = [
            [
                Paragraph(f"<b>Invoice Number:</b>", detail_style),
                Paragraph(self.invoice.invoice_number, detail_style)
            ],
            [
                Paragraph(f"<b>Invoice Date:</b>", detail_style),
                Paragraph(self.invoice.invoice_date.strftime('%d %B %Y'), detail_style)
            ],
            [
                Paragraph(f"<b>Due Date:</b>", detail_style),
                Paragraph(self.invoice.due_date.strftime('%d %B %Y'), detail_style)
            ],
            [
                Paragraph(f"<b>Billing Period:</b>", detail_style),
                Paragraph(f"{self.invoice.period_start.strftime('%d %b')} - {self.invoice.period_end.strftime('%d %b %Y')}", detail_style)
            ],
        ]
        
        table = Table(details_data, colWidths=[50*mm, 50*mm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        
        elements.append(table)
        
        return elements
    
    def _create_addresses(self):
        """Create company and customer address blocks"""
        elements = []
        
        # Get invoice settings
        from invoices.models import InvoiceSettings
        try:
            settings = InvoiceSettings.objects.first()
        except:
            settings = None
        
        addr_style = ParagraphStyle(
            'AddressStyle',
            parent=self.styles['Normal'],
            fontSize=9,
        )
        
        # Company address
        company_address = f"<b>From:</b><br/>"
        if settings:
            company_address += f"{settings.company_name}<br/>"
            company_address += settings.company_address.replace('\n', '<br/>')
            if settings.company_vat_number:
                company_address += f"<br/>VAT: {settings.company_vat_number}"
        
        # Customer address
        customer_address = f"<b>Bill To:</b><br/>"
        customer_address += f"{self.invoice.customer_name}<br/>"
        customer_address += self.invoice.customer_address.replace('\n', '<br/>')
        if self.invoice.customer_vat_number:
            customer_address += f"<br/>VAT: {self.invoice.customer_vat_number}"
        customer_address += f"<br/><br/><b>Email:</b> {self.invoice.customer_email}"
        
        addr_data = [[
            Paragraph(company_address, addr_style),
            Paragraph(customer_address, addr_style)
        ]]
        
        table = Table(addr_data, colWidths=[85*mm, 85*mm])
        table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        
        elements.append(table)
        
        return elements
    
    def _create_items_table(self):
        """Create line items table"""
        elements = []
        
        # Header
        data = [[
            Paragraph('<b>Description</b>', self.styles['Normal']),
            Paragraph('<b>Quantity</b>', self.styles['Normal']),
            Paragraph('<b>Unit Price</b>', self.styles['Normal']),
            Paragraph('<b>Total</b>', self.styles['Normal']),
        ]]
        
        # Items
        for item in self.invoice.items.all():
            desc = item.description
            if item.details:
                desc += f"<br/><font size=8>{item.details}</font>"
            
            data.append([
                Paragraph(desc, self.styles['Normal']),
                Paragraph(str(item.quantity), self.styles['Normal']),
                Paragraph(self.format_money(item.unit_price), self.styles['Normal']),
                Paragraph(self.format_money(item.total), self.styles['Normal']),
            ])
        
        table = Table(data, colWidths=[90*mm, 25*mm, 30*mm, 25*mm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366f1')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        
        elements.append(table)
        
        return elements
    
    def _create_totals(self):
        """Create totals section"""
        elements = []
        
        right_style = ParagraphStyle(
            'RightStyle',
            parent=self.styles['Normal'],
            fontSize=10,
            alignment=TA_RIGHT
        )
        
        totals_data = [
            [
                '',
                Paragraph('<b>Subtotal:</b>', right_style),
                Paragraph(self.format_money(self.invoice.subtotal), right_style)
            ],
            [
                '',
                Paragraph(f'<b>VAT ({self.invoice.vat_rate}%):</b>', right_style),
                Paragraph(self.format_money(self.invoice.vat_amount), right_style)
            ],
            [
                '',
                Paragraph('<b>TOTAL:</b>', right_style),
                Paragraph(f'<b>{self.format_money(self.invoice.total)}</b>', right_style)
            ],
        ]
        
        table = Table(totals_data, colWidths=[95*mm, 40*mm, 35*mm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (1, 2), (-1, 2), colors.HexColor('#6366f1')),
            ('TEXTCOLOR', (1, 2), (-1, 2), colors.whitesmoke),
            ('FONTSIZE', (1, 2), (-1, 2), 12),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('LINEABOVE', (1, 2), (-1, 2), 2, colors.HexColor('#6366f1')),
        ]))
        
        elements.append(table)
        
        return elements
    
    def _create_footer(self):
        """Create payment info and footer"""
        elements = []
        
        # Get invoice settings
        from invoices.models import InvoiceSettings
        try:
            settings = InvoiceSettings.objects.first()
        except:
            settings = None
        
        footer_style = ParagraphStyle(
            'FooterStyle',
            parent=self.styles['Normal'],
            fontSize=9,
        )
        
        # Payment terms
        payment_info = f"<b>Payment Terms:</b> Due within {self.invoice.due_date - self.invoice.invoice_date} days"
        
        if settings and settings.bank_name:
            payment_info += f"<br/><br/><b>Bank Details:</b><br/>"
            payment_info += f"Bank: {settings.bank_name}<br/>"
            if settings.bank_account:
                payment_info += f"Account: {settings.bank_account}<br/>"
            if settings.bank_swift:
                payment_info += f"SWIFT: {settings.bank_swift}"
        
        if self.invoice.notes:
            payment_info += f"<br/><br/><b>Notes:</b><br/>{self.invoice.notes}"
        
        if settings and settings.footer_note:
            payment_info += f"<br/><br/>{settings.footer_note}"
        
        elements.append(Paragraph(payment_info, footer_style))
        
        # Thank you message
        thank_you_style = ParagraphStyle(
            'ThankYouStyle',
            parent=self.styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#6366f1'),
        )
        
        elements.append(Spacer(1, 15*mm))
        elements.append(Paragraph("<b>Thank you for your business!</b>", thank_you_style))
        
        return elements
    
    def save_to_invoice(self):
        """Generate PDF and save to invoice model"""
        pdf_content = self.generate()
        
        # Save PDF to invoice
        filename = f"invoice_{self.invoice.invoice_number}.pdf"
        self.invoice.pdf_file.save(
            filename,
            ContentFile(pdf_content),
            save=True
        )
        
        return self.invoice.pdf_file.url


def generate_invoice_pdf(invoice):
    """
    Helper function to generate PDF for an invoice
    
    Usage:
        from invoices.utils import generate_invoice_pdf
        pdf_url = generate_invoice_pdf(invoice)
    """
    generator = InvoicePDFGenerator(invoice)
    return generator.save_to_invoice()
