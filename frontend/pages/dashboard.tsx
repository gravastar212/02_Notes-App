import Head from 'next/head';
import { GetServerSideProps } from 'next';
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

interface Note {
  id: string;
  title: string;
  content: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardProps {
  notes: Note[];
  user: {
    id: string;
    email: string;
    createdAt: string;
  } | null;
  error: string | null;
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

export const getServerSideProps: GetServerSideProps<DashboardProps> = async context => {
  const { req } = context;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    // Extract cookies from the request
    const cookies = req.headers.cookie || '';

    // First, try to get user info and notes using the refresh token cookie
    const notesResponse = await fetch(`${API_URL}/notes`, {
      method: 'GET',
      headers: {
        Cookie: cookies, // Forward all cookies from the client
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: include credentials for cookie-based auth
    });

    if (!notesResponse.ok) {
      // If notes request fails, try to refresh the token
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          Cookie: cookies,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!refreshResponse.ok) {
        // If refresh fails, redirect to login
        return {
          redirect: {
            destination: '/login',
            permanent: false,
          },
        };
      }

      // Get new access token from refresh response
      const refreshData = await refreshResponse.json();
      const newAccessToken = refreshData.accessToken;

      // Retry notes request with new access token
      const retryNotesResponse = await fetch(`${API_URL}/notes`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${newAccessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!retryNotesResponse.ok) {
        return {
          redirect: {
            destination: '/login',
            permanent: false,
          },
        };
      }

      const notesData = await retryNotesResponse.json();
      return {
        props: {
          notes: notesData.notes || [],
          user: { id: 'user-id', email: 'user@example.com', createdAt: new Date().toISOString() }, // Mock user data
          error: null,
        },
      };
    }

    const notesData = await notesResponse.json();

    // Try to get user info (this would need a separate endpoint or include it in notes response)
    // For now, we'll use mock data since we don't have a /me endpoint
    const user = { id: 'user-id', email: 'user@example.com', createdAt: new Date().toISOString() };

    return {
      props: {
        notes: notesData.notes || [],
        user,
        error: null,
      },
    };
  } catch (error) {
    console.error('Dashboard SSR Error:', error);
    return {
      props: {
        notes: [],
        user: null,
        error: 'Failed to load notes. Please try again.',
      },
    };
  }
};
