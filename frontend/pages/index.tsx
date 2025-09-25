import Head from 'next/head';
import { Box, Container, Heading, Text, VStack, Button, Link } from '@chakra-ui/react';
import Layout from '@/components/Layout';
import { optionalAuth } from '@/lib/withAuth';

interface HomeProps extends Record<string, unknown> {
  authData: {
    user: {
      id: string;
      email: string;
      createdAt: string;
    };
    accessToken: string;
  } | null;
}

export default function Home({ authData }: HomeProps) {

  return (
    <>
      <Head>
        <title>Notes App - Organize Your Thoughts</title>
        <meta name='description' content='A simple and elegant notes application' />
      </Head>

      <Layout>
        <Container maxW='container.xl' py={16}>
          <VStack gap={12} align='center'>
            {/* Hero Section */}
            <Box textAlign='center'>
              <Heading as='h1' size='4xl' color='gray.800' mb={6} fontWeight='bold'>
                Notes App
              </Heading>
              <Text fontSize='xl' color='gray.600' maxW='2xl' mx='auto'>
                Organize your thoughts, capture ideas, and never lose track of important information.
                Simple, elegant, and powerful note-taking for the modern world.
              </Text>
            </Box>

            {/* Authentication Status */}
            {authData ? (
              <Box
                bg='green.50'
                border='1px'
                borderColor='green.200'
                p={6}
                borderRadius='xl'
                textAlign='center'
                maxW='md'
                w='full'
              >
                <Text fontSize='lg' color='green.800' fontWeight='semibold' mb={2}>
                  Welcome back, {authData.user.email}!
                </Text>
                <Text fontSize='sm' color='green.600' mb={4}>
                  You&apos;re successfully authenticated and can access all features.
                </Text>
                <VStack gap={2}>
                  <Link href='/dashboard'>
                    <Button colorScheme='green' size='lg' borderRadius='xl' w='full'>
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link href='/profile'>
                    <Button variant='outline' colorScheme='green' size='md' borderRadius='xl' w='full'>
                      View Profile
                    </Button>
                  </Link>
                </VStack>
              </Box>
            ) : (
              <Box
                bg='blue.50'
                border='1px'
                borderColor='blue.200'
                p={6}
                borderRadius='xl'
                textAlign='center'
                maxW='md'
                w='full'
              >
                <Text fontSize='lg' color='blue.800' fontWeight='semibold' mb={2}>
                  Get Started Today
                </Text>
                <Text fontSize='sm' color='blue.600' mb={4}>
                  Create an account or sign in to start organizing your notes.
                </Text>
                <VStack gap={2}>
                  <Link href='/register'>
                    <Button colorScheme='blue' size='lg' borderRadius='xl' w='full'>
                      Create Account
                    </Button>
                  </Link>
                  <Link href='/login'>
                    <Button variant='outline' colorScheme='blue' size='md' borderRadius='xl' w='full'>
                      Sign In
                    </Button>
                  </Link>
                </VStack>
              </Box>
            )}

            {/* Features Section */}
            <Box w='full' maxW='4xl'>
              <Heading as='h2' size='2xl' color='gray.800' mb={8} textAlign='center'>
                Why Choose Notes App?
              </Heading>
              
              <VStack gap={8} align='stretch'>
                <Box
                  bg='white'
                  p={6}
                  borderRadius='xl'
                  border='1px'
                  borderColor='gray.200'
                  boxShadow='sm'
                >
                  <VStack gap={4} align='start'>
                    <Heading as='h3' size='lg' color='gray.700'>
                      🚀 Fast & Responsive
                    </Heading>
                    <Text color='gray.600'>
                      Built with Next.js and modern web technologies for lightning-fast performance
                      and smooth user experience across all devices.
                    </Text>
                  </VStack>
                </Box>

                <Box
                  bg='white'
                  p={6}
                  borderRadius='xl'
                  border='1px'
                  borderColor='gray.200'
                  boxShadow='sm'
                >
                  <VStack gap={4} align='start'>
                    <Heading as='h3' size='lg' color='gray.700'>
                      🔒 Secure & Private
                    </Heading>
                    <Text color='gray.600'>
                      Your notes are protected with industry-standard security. JWT authentication
                      and encrypted data storage ensure your information stays private.
                    </Text>
                  </VStack>
                </Box>

                <Box
                  bg='white'
                  p={6}
                  borderRadius='xl'
                  border='1px'
                  borderColor='gray.200'
                  boxShadow='sm'
                >
                  <VStack gap={4} align='start'>
                    <Heading as='h3' size='lg' color='gray.700'>
                      ✨ Beautiful Design
                    </Heading>
                    <Text color='gray.600'>
                      Clean, intuitive interface built with Chakra UI. Focus on your content
                      without distractions, with a design that adapts to your preferences.
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </Box>

            {/* Tech Stack */}
            <Box textAlign='center'>
              <Heading as='h2' size='xl' color='gray.800' mb={6}>
                Built with Modern Technology
              </Heading>
              <Text fontSize='lg' color='gray.600' mb={4}>
                Frontend: Next.js • Chakra UI • TypeScript
              </Text>
              <Text fontSize='lg' color='gray.600'>
                Backend: Express.js • PostgreSQL • Prisma • JWT
              </Text>
            </Box>
          </VStack>
        </Container>
      </Layout>
    </>
  );
}

// This page works with or without authentication
// If user is authenticated, authData will contain user info
// If not authenticated, authData will be null
export const getServerSideProps = optionalAuth<HomeProps>(async (context, authData) => {
  // You can add server-side logic here that works differently based on auth status
  // For example, showing different content for authenticated vs non-authenticated users
  
  return {
    props: {
      authData,
    },
  };
});