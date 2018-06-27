#include "address.h"
#include "ed25519key.h"

#include "headers/crypto.h"

napi_value Init(napi_env env, napi_value exports) {
    Orbs::CryptoSDK::Init();

    exports = Address::Init(env, exports);
    exports = ED25519Key::Init(env, exports);

    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
