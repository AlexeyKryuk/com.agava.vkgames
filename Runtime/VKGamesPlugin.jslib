const library = {
    $vkSDK: {
        bridge: undefined,

        isInitialized: false,
        isPlayerAGroupMember: false,

        vkWebAppInit: function (onInitializedCallback, onErrorCallback, isTest) {

            if (vkSDK.isInitialized) {
                return;
            }

            function setupVkBridge() {
                function invokeSuccess() {
                    vkSDK.isInitialized = true;
                    vkSDK.bridge = window['vkBridge'];
                    vkSDK.vkWebCheckPlayerOnGroupMembership();
                    dynCall('v', onInitializedCallback);
                }

                function invokeFailure(error) {
                    dynCall('v', onErrorCallback);
                    console.error(error);
                }

                if (isTest) {
                    window['vkBridge'] = {
                        send: function () {
                            return new Promise(function (resolve, reject) {
                                setTimeout(function () {
                                    reject(new Error('Error returned for testing purposes.'));
                                }, 0);
                            });
                        }
                    };
                    invokeSuccess();
                } else {
                    window['vkBridge'].send("VKWebAppInit", {})
                        .then(function (data) {
                            if (data.result) {
                                invokeSuccess();
                            } else {
                                invokeFailure(new Error('vkBridge failed to initialize.'));
                            }
                        })
                        .catch(function (error) {
                            invokeFailure(error);
                        });
                }
            }

            if (window['vkBridge'] == null) {
                const sdkScript = document.createElement('script');
                sdkScript.src = 'https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js';
                document.head.appendChild(sdkScript);

                sdkScript.onload = setupVkBridge;
                return;
            }

            setupVkBridge();
        },

        throwIfSdkNotInitialized: function () {
            if (!vkSDK.isInitialized) {
                throw new Error('SDK is not initialized. Invoke VKGamesSdk.Initialize() coroutine and wait for it to finish.');
            }
        },

        vkWebSAppShowRewardedAd: function (onRewardedCallback, onErrorCallback) {
            vkSDK.bridge.send("VKWebAppShowNativeAds", { ad_format: "reward" })
                .then(function (data) {
                    if (data.result)
                        dynCall('v', onRewardedCallback);
                })
                .catch(function (error) {
                    dynCall('v', onErrorCallback);
                    console.log(error);
                });
        },

        vkWebAppShowInterstitialAd: function (onOpenCallback, onErrorCallback) {
            vkSDK.bridge.send("VKWebAppShowNativeAds", { ad_format: "interstitial" })
                .then(function (data) {
                    if (data.result)
                        dynCall('v', onOpenCallback);
                })
                .catch(function (error) {
                    dynCall('v', onErrorCallback);
                    console.log(error);
                });
        },

        vkWebAppShowLeaderboardBox: function (playerScore, onErrorCallback) {
            vkSDK.bridge.send("VKWebAppShowLeaderBoardBox", { user_result: playerScore })
                .then(function (data) {
                    console.log(data.success);
                })
                .catch(function (error) {
                    dynCall('v', onErrorCallback);
                    console.log(error);
                });
        },

        vkWebAppShowInviteBox: function (onSuccessCallback, onErrorCallback) {
            vkSDK.bridge.send("VKWebAppShowInviteBox", {})
                .then(function (data) {
                    if (data.success)
                        dynCall('v', onSuccessCallback);
                })
                .catch(function (error) {
                    dynCall('v', onErrorCallback);
                    console.log(error);
                });
        },

        vkWebJoinGroup: function (onSuccessCallback, onErrorCallback) {
            vkSDK.bridge.send("VKWebAppJoinGroup", { "group_id": 84861196 })
                .then(function (data) {
                    if (data.result)
                        dynCall('v', onSuccessCallback);
                })
                .catch(function (error) {
                    dynCall('v', onErrorCallback);
                    console.log(error);
                });
        },

        vkWebCheckPlayerOnGroupMembership: function () {
            function invokeSuccess() {
                isPlayerAGroupMember = (data.is_member == 1);
            }
            
            vkSDK.bridge.send("VKWebAppGetGroupInfo", { "group_id": 84861196 })
                .then(function (data) {
                    invokeSuccess();
                })
                .catch(function (error) {
                    console.log(error);
                });
        },

        vkWebAppOpenPayForm: function (itemName, onSuccessCallback, onErrorCallback) {
            vkSDK.bridge.send('VKWebAppShowOrderBox', {
                type: 'item',
                item: UTF8ToString(itemName)
            })
                .then((data) => {
                    if (data.success) {
                        dynCall('v', onSuccessCallback);
                    }
                })
                .catch((error) => {
                    console.log(error);
                    dynCall('v', onErrorCallback);
                });
        },

        vkWebCompleteMission: function (id_app, activity_id, activity_value) {
            vkSDK.bridge.send('VKWebAppGetAuthToken', {
                app_id: id_app,
                scope: ''
            })
                .then((data) => {
                    if (data.access_token) {
                        vkSDK.bridge.send('VKWebAppCallAPIMethod', {
                            method: 'users.get',
                            params: {
                                access_token: data.access_token,
                                v: '5.131',
                            }
                        })
                            .then((data) => {
                                if (data.response) {
                                    vkSDK.bridge.send('VKWebAppCallAPIMethod', {
                                        method: 'secure.addAppEvent',
                                        params: {
                                            access_token: data.access_token,
                                            user_ids: data.response[0].id,
                                            activity_id: activity_id,
                                            value: activity_value,
                                            v: '5.131',
                                        }
                                    })
                                        .then((data) => {
                                            if (data.response) {
                                                console.log("Mission completed");
                                            }
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                        });
                                    
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    }
                })
                .catch((error) => {
                    console.log(error);
                });

        },
    },

    // C# calls

    WebAppInit: function (onInitializedCallback, onErrorCallback, isTest) {
        isTest = !!isTest;
        vkSDK.vkWebAppInit(onInitializedCallback, onErrorCallback, isTest);
    },

    ShowRewardedAds: function (onRewardedCallback, onErrorCallback) {
        vkSDK.throwIfSdkNotInitialized();

        vkSDK.vkWebSAppShowRewardedAd(onRewardedCallback, onErrorCallback);
    },

    ShowInterstitialAds: function (onOpenCallback, onErrorCallback) {
        vkSDK.throwIfSdkNotInitialized();

        vkSDK.vkWebAppShowInterstitialAd(onOpenCallback, onErrorCallback);
    },

    ShowLeaderboardBox: function (playerScore, onErrorCallback) {
        vkSDK.throwIfSdkNotInitialized();

        vkSDK.vkWebAppShowLeaderboardBox(playerScore, onErrorCallback);
    },

    ShowInviteBox: function (onSuccessCallback, onErrorCallback) {
        vkSDK.throwIfSdkNotInitialized();

        vkSDK.vkWebAppShowInviteBox(onSuccessCallback, onErrorCallback);
    },

    JoinIjuniorGroup: function (onSuccessCallback, onErrorCallback) {
        vkSDK.throwIfSdkNotInitialized();
        
        vkSDK.vkWebJoinGroup(onSuccessCallback, onErrorCallback);
    },

    IsInitialized: function () {
        return vkSDK.isInitialized;
    },

    IsPlayerAGroupMember: function () {
        return vkSDK.isPlayerAGroupMember;
    },

    VKWebAppOpenPayForm: function (itemName, onSuccessCallback, onErrorCallback) {
        vkSDK.throwIfSdkNotInitialized();

        vkSDK.vkWebAppOpenPayForm(itemName, onSuccessCallback, onErrorCallback);
    },

    VKWebCompleteMission: function (id_app, activity_id, activity_value = 0) {
        vkSDK.throwIfSdkNotInitialized();

        vkSDK.vkWebCompleteMission(id_app, activity_id, activity_value);
    }
}

autoAddDeps(library, '$vkSDK');
mergeInto(LibraryManager.library, library);
