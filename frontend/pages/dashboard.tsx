import Head from 'next/head';
import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Flex,
  useDisclosure,
} from '@chakra-ui/react';
import Layout from '@/components/Layout';
import NotesList from '@/components/NotesList';
import NewNoteForm from '@/components/NewNoteForm';
import EditNoteModal from '@/components/EditNoteModal';
import { useNotes } from '@/hooks/useNotes';
import { requireAuth } from '@/lib/withAuth';

interface Note {
  id: string;
  title: string;
  content: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardProps extends Record<string, unknown> {
  notes: Note[];
  user: {
    id: string;
    email: string;
    createdAt: string;
  } | null;
  error: string | null;
  authData: {
    user: {
      id: string;
      email: string;
      createdAt: string;
    };
    accessToken: string;
  };
}

export default function Dashboard({ notes: initialNotes, user, error }: DashboardProps) {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { open: isNewNoteOpen, onOpen: onNewNoteOpen, onClose: onNewNoteClose } = useDisclosure();
  const {
    open: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();

  const { notes, addNote, updateNote } = useNotes(initialNotes);

  const handleNewNoteSuccess = () => {
    onNewNoteClose();
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    onEditModalOpen();
  };

  const handleEditNoteSuccess = () => {
    setEditingNote(null);
    onEditModalClose();
  };

  const handleEditModalClose = () => {
    setEditingNote(null);
    onEditModalClose();
  };
  return (
    <>
      <Head>
        <title>Dashboard - Notes App</title>
        <meta name='description' content='Your personal notes dashboard' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Layout>
        <Container maxW='container.xl' py={8}>
          <VStack gap={8} align='stretch'>
            {/* Header */}
            <Box>
              <Heading as='h1' size='xl' color='gray.800' mb={2} fontWeight='bold'>
                Dashboard
              </Heading>
              <Text color='gray.600' fontSize='lg'>
                Welcome back, {user?.email || 'User'}! Manage your notes here.
              </Text>
            </Box>

            {/* Error State */}
            {error && (
              <Box bg='red.50' border='1px' borderColor='red.200' p={4} rounded='md'>
                <Text color='red.600'>{error}</Text>
              </Box>
            )}

            {/* Notes Section */}
            <Box>
              <Flex justify='space-between' align='center' mb={4}>
                <Heading as='h2' size='lg' color='gray.700' fontWeight='semibold'>
                  Your Notes
                </Heading>
                <Button
                  colorScheme='blue'
                  onClick={onNewNoteOpen}
                  borderRadius='xl'
                  fontWeight='semibold'
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: 'lg',
                  }}
                  _active={{
                    transform: 'translateY(0)',
                  }}
                  transition='all 0.2s'
                >
                  + New Note
                </Button>
              </Flex>

              {isNewNoteOpen && (
                <Box mb={6}>
                  <NewNoteForm
                    onSuccess={handleNewNoteSuccess}
                    onCancel={onNewNoteClose}
                    onSubmit={addNote}
                  />
                </Box>
              )}

              <NotesList notes={notes} onEditNote={handleEditNote} />
            </Box>
          </VStack>
        </Container>
      </Layout>

      <EditNoteModal
        note={editingNote}
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSuccess={handleEditNoteSuccess}
        onSubmit={updateNote}
      />
    </>
  );
}

export const getServerSideProps = requireAuth<DashboardProps>(async (context, authData) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const cookies = context.req.headers.cookie || '';

  try {
    // Fetch notes using the authenticated user's cookies
    const notesResponse = await fetch(`${API_URL}/notes`, {
      method: 'GET',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!notesResponse.ok) {
      throw new Error('Failed to fetch notes');
    }

    const notesData = await notesResponse.json();

    return {
      props: {
        notes: notesData.notes || [],
        user: authData.user,
        error: null,
        authData,
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      props: {
        notes: [],
        user: authData.user,
        error: 'Failed to load notes',
        authData,
      },
    };
  }
});
