import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Container, Heading, Input, Link, Text, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const errors: { email?: string; password?: string; confirmPassword?: string } = {};

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

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      await register(formData.email, formData.password);
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
        <title>Register - Notes App</title>
        <meta name='description' content='Create a new Notes App account' />
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
                Create your account
              </Heading>
              <Text color='gray.600' fontSize='lg'>
                Start organizing your thoughts and ideas
              </Text>
            </Box>

            {/* Registration Form */}
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
                      placeholder='Create a password'
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

                  {/* Confirm Password Field */}
                  <Box>
                    <Text mb={2} fontWeight='semibold' color='gray.800' fontSize='sm'>
                      Confirm password
                    </Text>
                    <Input
                      id='confirmPassword'
                      name='confirmPassword'
                      type='password'
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder='Confirm your password'
                      size='lg'
                      borderRadius='xl'
                      borderColor='gray.300'
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px #3b82f6',
                      }}
                    />
                    {formErrors.confirmPassword && (
                      <Text color='red.500' fontSize='sm' mt={2} ml={1}>
                        {formErrors.confirmPassword}
                      </Text>
                    )}
                  </Box>

                  {/* Create Account Button */}
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
                    loadingText='Creating account...'
                    disabled={isLoading}
                    transition='all 0.2s'
                    width='full'
                  >
                    Create account
                  </Button>
                </VStack>
              </form>
            </Box>

            {/* Footer Links */}
            <Box textAlign='center'>
              <Text color='gray.600' fontSize='sm' mb={4}>
                Already have an account?
              </Text>
              <Link as={NextLink} href='/login'>
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
                  Sign in instead
                </Button>
              </Link>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  );
}
