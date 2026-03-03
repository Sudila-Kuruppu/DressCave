import { Box, Button, Card, Heading, Input, Text, VStack, HStack } from "@chakra-ui/react"

export default function TestDesignSystem() {
  return (
    <Box p={8} maxW="1200px" mx="auto">
      <VStack gap={6} align="stretch">
        <Heading size="2xl" color="#FF6F61">
          Design System Test Page
        </Heading>
        
        <Card.Root p={6}>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Heading size="lg">Brand Colors</Heading>
              <HStack gap={4}>
                <Box w="50px" h="50px" bg="#FF6F61" borderRadius="md" />
                <Text>Primary (#FF6F61)</Text>
              </HStack>
              <HStack gap={4}>
                <Box w="50px" h="50px" bg="#4FA1A0" borderRadius="md" />
                <Text>Secondary (#4FA1A0)</Text>
              </HStack>
              <HStack gap={4}>
                <Box w="50px" h="50px" bg="#27AE60" borderRadius="md" />
                <Text>Success (#27AE60)</Text>
              </HStack>
              <HStack gap={4}>
                <Box w="50px" h="50px" bg="#F1C40F" borderRadius="md" />
                <Text>Warning (#F1C40F)</Text>
              </HStack>
              <HStack gap={4}>
                <Box w="50px" h="50px" bg="#E74C3C" borderRadius="md" />
                <Text>Error (#E74C3C)</Text>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root p={6}>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Heading size="lg">Components</Heading>
              <HStack gap={4}>
                <Button bg="#FF6F61" color="white" _hover={{ bg: "#e85a50" }}>Primary Button</Button>
                <Button bg="#4FA1A0" color="white" _hover={{ bg: "#3d8b8a" }}>Secondary Button</Button>
              </HStack>
              <Input placeholder="Test Input" borderColor="#4FA1A0" />
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root p={6}>
          <Card.Body>
            <Heading size="lg" mb={4}>Responsive Breakpoints</Heading>
            <Box 
              bg={{ base: "#FF6F61", md: "#4FA1A0", lg: "#27AE60" }} 
              p={4}
              borderRadius="md"
              color="white"
              textAlign="center"
            >
              <Text display={{ base: "block", md: "none" }}>Mobile (320-767px)</Text>
              <Text display={{ base: "none", md: "block", lg: "none" }}>Tablet (768-1023px)</Text>
              <Text display={{ base: "none", lg: "block" }}>Desktop (1024px+)</Text>
            </Box>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  )
}
