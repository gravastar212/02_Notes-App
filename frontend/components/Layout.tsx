import { Box, Flex, Heading, Spacer, Button, Text, HStack } from '@chakra-ui/react';
import { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <Box minH='100vh' bg='gray.50'>
      {/* Header */}
      <Box bg='white' shadow='sm' borderBottom='1px' borderColor='gray.200'>
        <Flex px={6} py={4} align='center'>
          <Link href='/'>
            <Heading as='h1' size='lg' color='blue.600' cursor='pointer'>
              Notes App
            </Heading>
          </Link>
          <Spacer />

          {/* Navigation */}
          <HStack gap={4}>
            {user ? (
              <>
                <Link href='/dashboard'>
                  <Button size='sm' variant='outline' colorScheme='blue'>
                    Dashboard
                  </Button>
                </Link>
                <Link href='/profile'>
                  <Button size='sm' variant='outline' colorScheme='gray'>
                    Profile
                  </Button>
                </Link>
                <Text color='gray.600' fontSize='sm'>
                  Welcome, {user.email}
                </Text>
                <Button size='sm' variant='outline' colorScheme='red' onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href='/login'>
                  <Button size='sm' variant='outline' colorScheme='blue'>
                    Login
                  </Button>
                </Link>
                <Link href='/register'>
                  <Button size='sm' colorScheme='blue'>
                    Register
                  </Button>
                </Link>
              </>
            )}
          </HStack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box as='main' minH='calc(100vh - 80px)'>
        {children}
      </Box>

      {/* Footer */}
      <Box bg='white' borderTop='1px' borderColor='gray.200' py={4}>
        <Box textAlign='center' color='gray.500' fontSize='sm'>
          © 2024 Notes App. Built with Next.js and Chakra UI.
        </Box>
      </Box>
    </Box>
  );
}
