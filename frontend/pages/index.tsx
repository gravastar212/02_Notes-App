import Head from "next/head";
import { Box, Container, Heading, Text } from "@chakra-ui/react";
import Layout from "@/components/Layout";

export default function Home() {
  return (
    <>
      <Head>
        <title>Notes App</title>
        <meta name="description" content="A simple notes application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Container maxW="container.xl" py={8}>
          <Box textAlign="center" mb={8}>
            <Heading as="h1" size="2xl" mb={4}>
              Notes App
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Your personal notes management system
            </Text>
          </Box>
          
          <Box>
            <Text textAlign="center" color="gray.500">
              Notes will be listed here...
            </Text>
          </Box>
        </Container>
      </Layout>
    </>
  );
}
