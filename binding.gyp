{
    "targets": [
        {
            "target_name": "cryptosdk",
            "sources": [
                "src/ed25519key.cpp",
                "src/address.cpp",
                "src/crypto-sdk.cpp"
            ],
            "cflags_cc!": [
                "-static",
                "-std=c++11",
                "-stdlib=libc++"
            ],
            "include_dirs": [
                "<(module_root_dir)/native"
            ],
            "conditions": [
                ["OS=='mac'", {
                    "libraries": [
                        "-Wl,-rpath,<(module_root_dir)/native/mac/",
                        "<(module_root_dir)/native/mac/libcryptosdk.dylib"
                    ],
                    "xcode_settings": {
                        "OTHER_CPLUSPLUSFLAGS": [
                            "-static",
                            "-std=c++11",
                            "-stdlib=libc++"
                        ],
                        "OTHER_LDFLAGS": [
                            "-stdlib=libc++"
                        ],
                        "MACOSX_DEPLOYMENT_TARGET": "10.13",
                        "GCC_ENABLE_CPP_EXCEPTIONS": "YES"
                    }
                }],
                ["OS=='linux'", {
                    "libraries": [
                        "-Wl,-rpath,<(module_root_dir)/native/linux/",
                        "<(module_root_dir)/native/linux/libcryptosdk.so"
                    ],
                }]
            ]
        }
    ]
}
