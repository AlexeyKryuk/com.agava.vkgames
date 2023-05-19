using System.Runtime.InteropServices;
using System;
using AOT;

namespace Agava.VKGames
{
    public static class Community
    {
        [DllImport("__Internal")]
        private static extern void JoinIjuniorGroup(Action onSuccessCallback, Action onErrorCallback);
        [DllImport("__Internal")]
        private static extern void VKWebCompleteMission(string id_app, uint activity_id, uint activity_value = 0);

        private static Action s_onRewardedCallback;
        private static Action s_onErrorCallback;

        public static void InviteToIJuniorGroup(Action onRewardedCallback = null, Action onErrorCallback = null)
        {
            s_onRewardedCallback = onRewardedCallback;
            s_onErrorCallback = onErrorCallback;

            JoinIjuniorGroup(OnSuccessCallback, OnErrorCallback);
        }

        public static void CompleteMission(string id_app, uint activity_id, uint activity_value = 0)
        {
            VKWebCompleteMission(id_app, activity_id, activity_value);
        }

        [MonoPInvokeCallback(typeof(Action))]
        private static void OnSuccessCallback()
        {
            s_onRewardedCallback?.Invoke();
        }

        [MonoPInvokeCallback(typeof(Action))]
        private static void OnErrorCallback()
        {
            s_onErrorCallback?.Invoke();
        }
    }
}

