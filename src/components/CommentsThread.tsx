import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { commentsService, Comment, CommentTarget } from '../services/commentsService';

/** Reusable comments thread for any commentable surface (risk/issue/task/
 *  project board). Lists comments and lets the user post one. Mentions are
 *  parsed-only for now (autocomplete picker is a follow-up). */
export const CommentsThread: React.FC<{ target: CommentTarget; isNL?: boolean }> = ({ target, isNL }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const load = async () => {
    setLoading(true);
    setComments(await commentsService.list(target));
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [target.projectId, target.targetId, target.taskId]);

  const post = async () => {
    const body = text.trim();
    if (!body || posting) return;
    setPosting(true);
    const created = await commentsService.add(target, body);
    setPosting(false);
    if (created) { setText(''); setComments((c) => [...c, created]); }
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(isNL ? 'nl-NL' : 'en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Ionicons name="chatbubbles-outline" size={18} color="#7c3aed" />
        <Text style={styles.header}>{isNL ? 'Reacties' : 'Comments'}</Text>
        <Text style={styles.count}>{comments.length}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ marginVertical: 12 }} />
      ) : comments.length === 0 ? (
        <Text style={styles.empty}>{isNL ? 'Nog geen reacties. Begin het gesprek.' : 'No comments yet. Start the conversation.'}</Text>
      ) : (
        comments.map((c) => (
          <View key={c.id} style={styles.comment}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(c.author_name || c.author_email || '?').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.author}>{c.author_name || c.author_email || (isNL ? 'Iemand' : 'Someone')}<Text style={styles.time}>  ·  {fmt(c.created_at)}</Text></Text>
              <Text style={styles.body}>{c.body}</Text>
            </View>
          </View>
        ))
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={isNL ? 'Schrijf een reactie…' : 'Write a comment…'}
          placeholderTextColor="#9ca3af"
          multiline
        />
        <TouchableOpacity style={[styles.send, (!text.trim() || posting) && styles.sendDisabled]} onPress={post} disabled={!text.trim() || posting}>
          {posting ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="send" size={16} color="#fff" />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginTop: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  header: { fontSize: 15, fontWeight: '700', color: '#111827', marginLeft: 6, flex: 1 },
  count: { fontSize: 12, fontWeight: '700', color: '#9ca3af' },
  empty: { fontSize: 13, color: '#6b7280', paddingVertical: 10 },
  comment: { flexDirection: 'row', gap: 10, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#f1f1f4' },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#7c3aed', fontWeight: '700', fontSize: 13 },
  author: { fontSize: 13, fontWeight: '600', color: '#374151' },
  time: { fontSize: 11, fontWeight: '400', color: '#9ca3af' },
  body: { fontSize: 14, color: '#111827', marginTop: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, maxHeight: 100, color: '#111827' },
  send: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { backgroundColor: '#c4b5fd' },
});
