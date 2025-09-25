import { Box, Text, VStack, Button, HStack } from '@chakra-ui/react';
import { useState } from 'react';
import NoteCard from './NoteCard';

interface Note {
  id: string;
  title: string;
  content: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesListProps {
  notes: Note[];
  onEditNote?: (note: Note) => void;
}

export default function NotesList({ notes, onEditNote }: NotesListProps) {
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'title'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sort notes based on current sort settings
  const sortedNotes = [...notes].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSortChange = (newSortBy: 'createdAt' | 'updatedAt' | 'title') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  if (notes.length === 0) {
    return (
      <Box
        textAlign='center'
        py={12}
        bg='gray.50'
        borderRadius='xl'
        border='2px dashed'
        borderColor='gray.300'
      >
        <Text fontSize='lg' color='gray.500' mb={4}>
          No notes yet
        </Text>
        <Text color='gray.400' mb={6}>
          Create your first note to get started!
        </Text>
        <Button colorScheme='blue' size='lg' borderRadius='xl'>
          Create Note
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Sort Controls */}
      <HStack justify='space-between' mb={6} flexWrap='wrap' gap={4}>
        <Text color='gray.600' fontSize='sm'>
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </Text>
        <HStack gap={2}>
          <Text fontSize='sm' color='gray.600'>
            Sort by:
          </Text>
          <Button
            size='sm'
            variant={sortBy === 'updatedAt' ? 'solid' : 'outline'}
            colorScheme={sortBy === 'updatedAt' ? 'blue' : 'gray'}
            onClick={() => handleSortChange('updatedAt')}
            borderRadius='md'
          >
            Updated
            {sortBy === 'updatedAt' && (
              <Text ml={1} fontSize='xs'>
                {sortOrder === 'desc' ? '↓' : '↑'}
              </Text>
            )}
          </Button>
          <Button
            size='sm'
            variant={sortBy === 'createdAt' ? 'solid' : 'outline'}
            colorScheme={sortBy === 'createdAt' ? 'blue' : 'gray'}
            onClick={() => handleSortChange('createdAt')}
            borderRadius='md'
          >
            Created
            {sortBy === 'createdAt' && (
              <Text ml={1} fontSize='xs'>
                {sortOrder === 'desc' ? '↓' : '↑'}
              </Text>
            )}
          </Button>
          <Button
            size='sm'
            variant={sortBy === 'title' ? 'solid' : 'outline'}
            colorScheme={sortBy === 'title' ? 'blue' : 'gray'}
            onClick={() => handleSortChange('title')}
            borderRadius='md'
          >
            Title
            {sortBy === 'title' && (
              <Text ml={1} fontSize='xs'>
                {sortOrder === 'desc' ? '↓' : '↑'}
              </Text>
            )}
          </Button>
        </HStack>
      </HStack>

      {/* Notes Grid */}
      <VStack gap={4} align='stretch'>
        {sortedNotes.map(note => (
          <NoteCard key={note.id} note={note} onEdit={onEditNote} />
        ))}
      </VStack>
    </Box>
  );
}
