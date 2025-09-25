import { useState, useCallback } from 'react';

interface Note {
  id: string;
  title: string;
  content: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export function useNotes(initialNotes: Note[]) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isLoading, setIsLoading] = useState(false);

  const addNote = useCallback(async (noteData: { title: string; content: string | null }) => {
    setIsLoading(true);

    // Optimistic update: Add note immediately with temporary ID
    const tempNote: Note = {
      id: `temp-${Date.now()}`,
      title: noteData.title,
      content: noteData.content,
      userId: 'temp-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes(prev => [tempNote, ...prev]);

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      const result = await response.json();

      // Replace temp note with real note
      setNotes(prev => prev.map(note => (note.id === tempNote.id ? result.note : note)));

      return result.note;
    } catch (error) {
      // Rollback optimistic update on error
      setNotes(prev => prev.filter(note => note.id !== tempNote.id));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateNote = useCallback(
    async (noteId: string, noteData: { title: string; content: string | null }) => {
      setIsLoading(true);

      // Optimistic update: Update note immediately
      const originalNote = notes.find(note => note.id === noteId);
      if (!originalNote) return;

      const optimisticNote: Note = {
        ...originalNote,
        title: noteData.title,
        content: noteData.content,
        updatedAt: new Date().toISOString(),
      };

      setNotes(prev => prev.map(note => (note.id === noteId ? optimisticNote : note)));

      try {
        const response = await fetch(`/api/notes/${noteId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(noteData),
        });

        if (!response.ok) {
          throw new Error('Failed to update note');
        }

        const result = await response.json();

        // Replace with server response
        setNotes(prev => prev.map(note => (note.id === noteId ? result.note : note)));

        return result.note;
      } catch (error) {
        // Rollback optimistic update on error
        setNotes(prev => prev.map(note => (note.id === noteId ? originalNote : note)));
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [notes],
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      setIsLoading(true);

      // Optimistic update: Remove note immediately
      const originalNote = notes.find(note => note.id === noteId);
      if (!originalNote) return;

      setNotes(prev => prev.filter(note => note.id !== noteId));

      try {
        const response = await fetch(`/api/notes/${noteId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to delete note');
        }
      } catch (error) {
        // Rollback optimistic update on error
        setNotes(prev =>
          [...prev, originalNote].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [notes],
  );

  const refreshNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notes', {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        setNotes(result.notes || []);
      }
    } catch (error) {
      console.error('Failed to refresh notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
    refreshNotes,
  };
}
