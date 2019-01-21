import * as Signature from "./Signature";
import { getTextEncoder } from "../membuffers/text";

const someDataToSign = getTextEncoder().encode("this is what we want to sign");
const PublicKey1 = Buffer.from("92d469d7c004cc0b24a192d9457836bf38effa27536627ef60718b00b0f33152", "hex");
const PrivateKey1 = Buffer.from("3b24b5f9e6b1371c3b5de2e402a96930eeafe52111bb4a1b003e5ecad3fab53892d469d7c004cc0b24a192d9457836bf38effa27536627ef60718b00b0f33152", "hex");

test("SignEd25519", () => {
  const sig = Signature.signEd25519(PrivateKey1, someDataToSign);
  expect(Signature.verifyEd25519(PublicKey1, someDataToSign, sig)).toBe(true);

  sig[0] += 1; // corrupt the signature
  expect(Signature.verifyEd25519(PublicKey1, someDataToSign, sig)).toBe(false);
});
