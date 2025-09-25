import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Container, Heading, Input, Link, Text, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      router.push('/');
    } catch {
      // Error is handled by AuthContext
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <>
      <Head>
        <title>Login - Notes App</title>
        <meta name='description' content='Login to your Notes App account' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Box
        minH='100vh'
        bg='gray.50'
        display='flex'
        alignItems='center'
        justifyContent='center'
        p={4}
      >
        <Container maxW='md'>
          <VStack gap={8} align='stretch'>
            {/* Header */}
            <Box textAlign='center'>
              <Box
                w={16}
                h={16}
                bg='blue.500'
                borderRadius='xl'
                display='flex'
                alignItems='center'
                justifyContent='center'
                mx='auto'
                mb={6}
                boxShadow='lg'
              >
                <Text fontSize='2xl' fontWeight='bold' color='white'>
                  N
                </Text>
              </Box>
              <Heading as='h1' size='xl' color='gray.800' mb={2} fontWeight='bold'>
                Welcome back
              </Heading>
              <Text color='gray.600' fontSize='lg'>
                Sign in to continue to your notes
              </Text>
            </Box>

            {/* Login Form */}
            <Box
              bg='white'
              p={8}
              borderRadius='2xl'
              boxShadow='xl'
              border='1px'
              borderColor='gray.200'
            >
              <form onSubmit={handleSubmit}>
                <VStack gap={6} align='stretch'>
                  {error && (
                    <Box bg='red.50' border='1px' borderColor='red.200' p={4} rounded='md'>
                      <Text color='red.600'>{error}</Text>
                    </Box>
                  )}

                  {/* Email Field */}
                  <Box>
                    <Text mb={2} fontWeight='semibold' color='gray.800' fontSize='sm'>
                      Email address
                    </Text>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder='Enter your email'
                      size='lg'
                      borderRadius='xl'
                      borderColor='gray.300'
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px #3b82f6',
                      }}
                    />
                    {formErrors.email && (
                      <Text color='red.500' fontSize='sm' mt={2} ml={1}>
                        {formErrors.email}
                      </Text>
                    )}
                  </Box>

                  {/* Password Field */}
                  <Box>
                    <Text mb={2} fontWeight='semibold' color='gray.800' fontSize='sm'>
                      Password
                    </Text>
                    <Input
                      id='password'
                      name='password'
                      type='password'
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder='Enter your password'
                      size='lg'
                      borderRadius='xl'
                      borderColor='gray.300'
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px #3b82f6',
                      }}
                    />
                    {formErrors.password && (
                      <Text color='red.500' fontSize='sm' mt={2} ml={1}>
                        {formErrors.password}
                      </Text>
                    )}
                  </Box>

                  {/* Sign In Button */}
                  <Button
                    type='submit'
                    size='lg'
                    bg='blue.500'
                    color='white'
                    borderRadius='xl'
                    fontWeight='semibold'
                    fontSize='md'
                    py={6}
                    _hover={{
                      bg: 'blue.600',
                      transform: 'translateY(-1px)',
                      boxShadow: 'lg',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                    loading={isLoading}
                    loadingText='Signing in...'
                    disabled={isLoading}
                    transition='all 0.2s'
                    width='full'
                  >
                    Sign in
                  </Button>
                </VStack>
              </form>
            </Box>

            {/* Footer Links */}
            <Box textAlign='center'>
              <Text color='gray.600' fontSize='sm' mb={4}>
                Don&apos;t have an account?
              </Text>
              <Link as={NextLink} href='/register'>
                <Button
                  variant='outline'
                  size='lg'
                  borderRadius='xl'
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
                  Create account
                </Button>
              </Link>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  );
}
