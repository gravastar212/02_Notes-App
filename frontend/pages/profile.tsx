import Head from 'next/head';
import { Box, Container, Heading, Text, VStack, Button } from '@chakra-ui/react';
import Layout from '@/components/Layout';
import { requireAuth } from '@/lib/withAuth';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileProps extends Record<string, unknown> {
  authData: {
    user: {
      id: string;
      email: string;
      createdAt: string;
    };
    accessToken: string;
  };
}

export default function Profile({ authData }: ProfileProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <Head>
        <title>Profile - Notes App</title>
        <meta name='description' content='User profile page' />
      </Head>

      <Layout>
        <Container maxW='container.xl' py={8}>
          <VStack gap={8} align='stretch'>
            {/* Header */}
            <Box textAlign='center'>
              <Heading as='h1' size='2xl' color='gray.800' mb={4} fontWeight='bold'>
                User Profile
              </Heading>
              <Text fontSize='lg' color='gray.600'>
                Manage your account settings and preferences
              </Text>
            </Box>

            {/* Profile Information */}
            <Box
              bg='white'
              p={8}
              borderRadius='xl'
              border='1px'
              borderColor='gray.200'
              boxShadow='sm'
            >
              <VStack gap={6} align='stretch'>
                <Heading as='h2' size='lg' color='gray.700' fontWeight='semibold'>
                  Account Information
                </Heading>

                <Box>
                  <Text fontSize='sm' fontWeight='semibold' color='gray.500' mb={2}>
                    User ID
                  </Text>
                  <Text fontSize='md' color='gray.800' fontFamily='mono'>
                    {authData.user.id}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize='sm' fontWeight='semibold' color='gray.500' mb={2}>
                    Email Address
                  </Text>
                  <Text fontSize='md' color='gray.800'>
                    {authData.user.email}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize='sm' fontWeight='semibold' color='gray.500' mb={2}>
                    Member Since
                  </Text>
                  <Text fontSize='md' color='gray.800'>
                    {new Date(authData.user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </Box>

                <Box pt={4} borderTop='1px' borderColor='gray.200'>
                  <Button
                    colorScheme='red'
                    variant='outline'
                    onClick={handleLogout}
                    borderRadius='lg'
                    fontWeight='semibold'
                    _hover={{
                      bg: 'red.50',
                      borderColor: 'red.300',
                    }}
                  >
                    Sign Out
                  </Button>
                </Box>
              </VStack>
            </Box>

            {/* Additional Settings */}
            <Box
              bg='white'
              p={8}
              borderRadius='xl'
              border='1px'
              borderColor='gray.200'
              boxShadow='sm'
            >
              <VStack gap={6} align='stretch'>
                <Heading as='h2' size='lg' color='gray.700' fontWeight='semibold'>
                  Settings
                </Heading>

                <Box>
                  <Text fontSize='sm' fontWeight='semibold' color='gray.500' mb={2}>
                    Theme
                  </Text>
                  <Text fontSize='md' color='gray.600'>
                    Light mode (coming soon)
                  </Text>
                </Box>

                <Box>
                  <Text fontSize='sm' fontWeight='semibold' color='gray.500' mb={2}>
                    Notifications
                  </Text>
                  <Text fontSize='md' color='gray.600'>
                    Email notifications enabled (coming soon)
                  </Text>
                </Box>

                <Box>
                  <Text fontSize='sm' fontWeight='semibold' color='gray.500' mb={2}>
                    Data Export
                  </Text>
                  <Text fontSize='md' color='gray.600'>
                    Export your notes (coming soon)
                  </Text>
                </Box>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Layout>
    </>
  );
}

// This page requires authentication - users will be redirected to /login if not authenticated
export const getServerSideProps = requireAuth<ProfileProps>(async (context, authData) => {
  // You can add additional server-side logic here if needed
  // For example, fetching user preferences, settings, etc.
  
  return {
    props: {
      authData,
    },
  };
});
