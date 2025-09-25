import { Box, Text, Heading, HStack, VStack, Button } from '@chakra-ui/react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Note {
  id: string;
  title: string;
  content: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
}

export default function NoteCard({ note, onEdit }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(note);
    } else {
      setIsEditing(true);
      setEditTitle(note.title);
      setEditContent(note.content || '');
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim()) {
      alert('Title is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      alert('Note updated successfully');
      setIsEditing(false);
      // In a real app, you'd want to update the parent state or refetch data
      window.location.reload(); // Simple refresh for now
    } catch {
      alert('Failed to update note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(note.title);
    setEditContent(note.content || '');
  };

  const handleDelete = async () => {
    if (
      !confirm(`Are you sure you want to delete "${note.title}"? This action cannot be undone.`)
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      alert('Note deleted successfully');
      // In a real app, you'd want to update the parent state or refetch data
      window.location.reload(); // Simple refresh for now
    } catch {
      alert('Failed to delete note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <Box
      bg='white'
      p={6}
      borderRadius='xl'
      border='1px'
      borderColor='gray.200'
      boxShadow='sm'
      _hover={{
        boxShadow: 'md',
        borderColor: 'gray.300',
      }}
      transition='all 0.2s'
    >
      {isEditing ? (
        <VStack gap={4} align='stretch'>
          <Box>
            <Text mb={2} fontWeight='semibold' color='gray.800' fontSize='sm'>
              Title
            </Text>
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder='Note title'
              style={{
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                width: '100%',
                fontSize: '16px',
                fontWeight: '600',
              }}
            />
          </Box>
          <Box>
            <Text mb={2} fontWeight='semibold' color='gray.800' fontSize='sm'>
              Content
            </Text>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              placeholder='Note content'
              style={{
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                width: '100%',
                minHeight: '120px',
                resize: 'vertical',
              }}
            />
          </Box>
          <HStack justify='flex-end' gap={2}>
            <Button
              size='sm'
              variant='outline'
              onClick={handleCancel}
              disabled={isLoading}
              borderRadius='lg'
            >
              Cancel
            </Button>
            <Button
              size='sm'
              colorScheme='blue'
              onClick={handleSave}
              loading={isLoading}
              loadingText='Saving...'
              disabled={isLoading}
              borderRadius='lg'
            >
              Save
            </Button>
          </HStack>
        </VStack>
      ) : (
        <VStack gap={4} align='stretch'>
          <HStack justify='space-between' align='flex-start'>
            <VStack align='flex-start' gap={1} flex='1'>
              <Heading as='h3' size='md' color='gray.800' fontWeight='semibold'>
                {note.title}
              </Heading>
              <Text fontSize='sm' color='gray.500'>
                Updated {formatDate(note.updatedAt)}
              </Text>
            </VStack>
            <Button
              size='sm'
              variant='ghost'
              onClick={handleEdit}
              color='blue.500'
              _hover={{ bg: 'blue.50' }}
              borderRadius='md'
            >
              Edit
            </Button>
          </HStack>

          {note.content && (
            <Box>
              <Text color='gray.700' lineHeight='1.6' whiteSpace='pre-wrap'>
                {note.content}
              </Text>
            </Box>
          )}

          <HStack justify='space-between' align='center'>
            <Text fontSize='xs' color='gray.400'>
              Created {formatDate(note.createdAt)}
            </Text>
            <HStack gap={2}>
              <Button
                size='xs'
                variant='ghost'
                onClick={handleEdit}
                color='blue.500'
                _hover={{ bg: 'blue.50' }}
                borderRadius='md'
              >
                Edit
              </Button>
              <Button
                size='xs'
                variant='ghost'
                onClick={handleDelete}
                color='red.500'
                _hover={{ bg: 'red.50' }}
                borderRadius='md'
                disabled={isLoading}
              >
                Delete
              </Button>
            </HStack>
          </HStack>
        </VStack>
      )}
    </Box>
  );
}
