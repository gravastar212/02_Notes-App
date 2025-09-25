import { useState, useEffect } from 'react';
import { Box, Button, Text, HStack, VStack } from '@chakra-ui/react';
import apiClient from '@/lib/api';

interface Note {
  id: string;
  title: string;
  content: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface EditNoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit?: (noteId: string, noteData: { title: string; content: string | null }) => Promise<unknown>;
}

export default function EditNoteModal({
  note,
  isOpen,
  onClose,
  onSuccess,
  onSubmit,
}: EditNoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || '');
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!note) return;

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const noteData = {
        title: title.trim(),
        content: content.trim() || null,
      };

      if (onSubmit) {
        // Use optimistic UI handler
        await onSubmit(note.id, noteData);
      } else {
        // Fallback to direct API call using apiClient
        await apiClient.put(`/notes/${note.id}`, noteData);
      }

      // Call success callback
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setTitle('');
    setContent('');
    onClose();
  };

  if (!isOpen || !note) {
    return null;
  }

  return (
    <Box
      position='fixed'
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg='blackAlpha.600'
      display='flex'
      alignItems='center'
      justifyContent='center'
      zIndex={1000}
    >
      <Box bg='white' p={6} borderRadius='xl' maxW='md' mx={4} boxShadow='xl' width='full'>
        <form onSubmit={handleSubmit}>
          <VStack gap={4} align='stretch'>
            <Text fontSize='lg' fontWeight='semibold' color='gray.800'>
              Edit Note
            </Text>

            {error && (
              <Box bg='red.50' border='1px' borderColor='red.200' p={3} rounded='md'>
                <Text color='red.600' fontSize='sm'>
                  {error}
                </Text>
              </Box>
            )}

            <Box>
              <Text mb={2} fontWeight='semibold' color='gray.800' fontSize='sm'>
                Title
              </Text>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='Enter note title'
                style={{
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  width: '100%',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
                disabled={isLoading}
              />
            </Box>

            <Box>
              <Text mb={2} fontWeight='semibold' color='gray.800' fontSize='sm'>
                Content
              </Text>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder='Enter note content'
                style={{
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  width: '100%',
                  minHeight: '120px',
                  resize: 'vertical',
                }}
                disabled={isLoading}
              />
            </Box>

            <HStack justify='flex-end' gap={2}>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={handleClose}
                disabled={isLoading}
                borderRadius='lg'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                size='sm'
                colorScheme='blue'
                loading={isLoading}
                loadingText='Saving...'
                disabled={isLoading}
                borderRadius='lg'
              >
                Save Changes
              </Button>
            </HStack>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}
