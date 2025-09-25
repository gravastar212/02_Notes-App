import { Box, Flex, Heading, Spacer } from "@chakra-ui/react";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
        <Flex px={6} py={4} align="center">
          <Heading as="h1" size="lg" color="blue.600">
            Notes App
          </Heading>
          <Spacer />
          {/* Navigation will be added here later */}
        </Flex>
      </Box>

      {/* Main Content */}
      <Box as="main" minH="calc(100vh - 80px)">
        {children}
      </Box>

      {/* Footer */}
      <Box bg="white" borderTop="1px" borderColor="gray.200" py={4}>
        <Box textAlign="center" color="gray.500" fontSize="sm">
          © 2024 Notes App. Built with Next.js and Chakra UI.
        </Box>
      </Box>
    </Box>
  );
}
