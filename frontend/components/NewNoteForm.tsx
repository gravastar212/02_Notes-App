import { useState } from 'react';
import { Box, Button, Text, HStack, VStack } from '@chakra-ui/react';
import apiClient from '@/lib/api';

interface NewNoteFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  onSubmit?: (noteData: { title: string; content: string | null }) => Promise<unknown>;
}

export default function NewNoteForm({ onSuccess, onCancel, onSubmit }: NewNoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        await onSubmit(noteData);
      } else {
        // Fallback to direct API call using apiClient
        await apiClient.post('/notes', noteData);
      }

      // Clear form
      setTitle('');
      setContent('');

      // Call success callback
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg='white' p={6} borderRadius='xl' border='1px' borderColor='gray.200' boxShadow='sm'>
      <form onSubmit={handleSubmit}>
        <VStack gap={4} align='stretch'>
          <Text fontSize='lg' fontWeight='semibold' color='gray.800'>
            Create New Note
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
              onClick={onCancel}
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
              loadingText='Creating...'
              disabled={isLoading}
              borderRadius='lg'
            >
              Create Note
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
}
