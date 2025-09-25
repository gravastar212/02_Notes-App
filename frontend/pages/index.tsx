import Head from 'next/head';
import { Box, Container, Heading, Text, Button, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>Notes App</title>
        <meta name='description' content='A simple notes application' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Layout>
        <Box
          minH='calc(100vh - 160px)'
          display='flex'
          alignItems='center'
          justifyContent='center'
          p={4}
        >
          <Container maxW='container.md'>
            <VStack gap={8} align='stretch' textAlign='center'>
              {/* Header */}
              <Box>
                <Box
                  w={20}
                  h={20}
                  bg='blue.500'
                  borderRadius='xl'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                  mx='auto'
                  mb={6}
                  boxShadow='lg'
                >
                  <Text fontSize='3xl' fontWeight='bold' color='white'>
                    N
                  </Text>
                </Box>
                <Heading as='h1' size='2xl' color='gray.800' mb={4} fontWeight='bold'>
                  Notes App
                </Heading>
                <Text fontSize='xl' color='gray.600' maxW='md' mx='auto'>
                  Your personal notes management system
                </Text>
              </Box>

              {/* Content */}
              <Box>
                {user ? (
                  <VStack gap={6}>
                    <Text fontSize='lg' color='green.600' fontWeight='medium'>
                      Welcome back, {user.email}!
                    </Text>
                    <Text color='gray.500' maxW='md' mx='auto'>
                      Your notes will be listed here...
                    </Text>
                    <Button
                      colorScheme='blue'
                      size='lg'
                      borderRadius='xl'
                      px={8}
                      py={6}
                      fontSize='md'
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
                      Create New Note
                    </Button>
                  </VStack>
                ) : (
                  <VStack gap={6}>
                    <Text fontSize='lg' color='gray.500' maxW='md' mx='auto'>
                      Please sign in to access your notes
                    </Text>
                    <VStack gap={4}>
                      <Link href='/login'>
                        <Button
                          colorScheme='blue'
                          size='lg'
                          borderRadius='xl'
                          px={8}
                          py={6}
                          fontSize='md'
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
                          Sign In
                        </Button>
                      </Link>
                      <Link href='/register'>
                        <Button
                          variant='outline'
                          colorScheme='blue'
                          size='lg'
                          borderRadius='xl'
                          px={8}
                          py={6}
                          fontSize='md'
                          fontWeight='semibold'
                          borderColor='gray.300'
                          color='gray.700'
                          _hover={{
                            borderColor: 'blue.500',
                            color: 'blue.500',
                            transform: 'translateY(-1px)',
                          }}
                          _active={{
                            transform: 'translateY(0)',
                          }}
                          transition='all 0.2s'
                        >
                          Create Account
                        </Button>
                      </Link>
                    </VStack>
                  </VStack>
                )}
              </Box>
            </VStack>
          </Container>
        </Box>
      </Layout>
    </>
  );
}
