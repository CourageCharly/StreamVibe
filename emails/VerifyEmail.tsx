import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

type Props = {
  otp: string;
};

export function VerifyEmail({ otp }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your verification code is {otp}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading as="h2" style={heading}>
            Verify your email
          </Heading>
          <Text style={paragraph}>
            Use the verification code below to continue:
          </Text>
          <Heading as="h1" style={code}>
            {otp}
          </Heading>
          <Text style={paragraph}>This code expires in 10 minutes.</Text>
          <Text style={muted}>
            If you didn&apos;t request this code, you can safely ignore this
            email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default VerifyEmail;

const body = {
  backgroundColor: "#141414",
  fontFamily:
    "Manrope, Arial, Helvetica, sans-serif",
  margin: 0,
  padding: "24px 12px",
};

const container = {
  backgroundColor: "#0F0F0F",
  border: "1px solid #262626",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "480px",
  padding: "32px 28px",
};

const heading = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: 700,
  margin: "0 0 16px",
};

const paragraph = {
  color: "#999999",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "0 0 16px",
};

const code = {
  color: "#ffffff",
  fontSize: "36px",
  fontWeight: 700,
  letterSpacing: "6px",
  margin: "8px 0 20px",
};

const muted = {
  color: "#999999",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: 0,
};
