// import { createClient } from "@supabase/supabase-js";

// export const supabase = createClient(
//   import.meta.env.VITE_PUBLIC_SUPABASE_URL,
//   import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
// );

const chromeStorageKeys = {
  gauthAccessToken: "gauthAccessToken",
  gauthRefreshToken: "gauthRefreshToken",
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.action) {
    case "signInWithGoogle": {
      // remove any old listener if exists
      chrome.tabs.onUpdated.removeListener(setTokens);
      const url = request.payload.url;

      // create new tab with that url
      chrome.tabs.create({ url: url, active: true }, (tab) => {
        // add listener to that url and watch for access_token and refresh_token query string params
        chrome.tabs.onUpdated.addListener(setTokens);
        // sendResponse(request.action + " executed");
      });

      break;
    }
    case "logout": {
      chrome.tabs.reload()
      // chrome.tabs.onUpdated.removeListener(setTokens);
      break;
    }
    case "pricing": {
      const url = request.payload.url;
      chrome.tabs.create({ url: url, active: true }, (tab) => { });
      break
    }

    default:
      break;
  }

  return true;
});

// chrome.runtime.onInstalled?.addListener(function () {
//   chrome.tabs.create({
//     url: "https://www.youtube.com/live/RXeOiIDNNek"
//   })
// })

const setTokens = async (
  tabId: number,
  changeInfo: any,
  tab: chrome.tabs.Tab,
) => {
  // once the tab is loaded
  if (tab.status === "complete") {
    if (!tab.url) return;
    const url = new URL(tab.url);

    // at this point user is logged-in to the web app
    // url should look like this: https://my.webapp.com/#access_token=xx&expires_in=3600&provider_token=yxxx&token_type=xxx
    // parse access_token and refresh_token from query string params
    // const targetUrl = 'https://go-sea-template.vercel.app'
    const targetUrl = import.meta.env.VITE_SITE_URL
    if (url.origin === targetUrl) {

      const currentUrl = new URL(url.href);
      const hashParamsString = currentUrl.hash.slice(1);
      const hashParams = new URLSearchParams(hashParamsString);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (!tab.id) return;
      if (accessToken) {
        // we can close that tab now
        // await chrome.tabs.remove(tab.id);
        // store access_token and refresh_token in storage as these will be used to authenticate user in chrome extension
        await chrome.storage.sync.set({
          [chromeStorageKeys.gauthAccessToken]: accessToken,
        });
        await chrome.storage.sync.set({
          [chromeStorageKeys.gauthRefreshToken]: refreshToken,
        });
        // init session
        // await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken || '' })

        // remove tab listener as tokens are set
        chrome.tabs.onUpdated.removeListener(setTokens);
      }
    }
  }
};

export async function getSupabaseAuthInfo() {
  const gauthAccessToken = (
    await chrome.storage.sync.get(chromeStorageKeys.gauthAccessToken)
  )[chromeStorageKeys.gauthAccessToken];
  const gauthRefreshToken = (
    await chrome.storage.sync.get(chromeStorageKeys.gauthRefreshToken)
  )[chromeStorageKeys.gauthRefreshToken];
  return {
    gauthAccessToken: gauthAccessToken,
    gauthRefreshToken: gauthRefreshToken
  }
}

export async function signInWithGoogle() {
  // const redirectTo = "https://go-sea-template.vercel.app";
  const redirectTo = import.meta.env.VITE_SITE_URL + '/bingmap-extension-auth'
  // const { data, error } = await supabase.auth.signInWithOAuth({
  //   provider: "google",
  //   options: {
  //     redirectTo: redirectTo,
  //     skipBrowserRedirect: true,
  //   },
  // });
  try {
    // tell background service worker to create a new tab with that url
    // await chrome.runtime.sendMessage({
    //   action: "signInWithGoogle",
    //   payload: { url: data.url },
    // });
  } catch (error) {
  }
}

export async function signOut() {
  // const { error } = await supabase.auth.signOut();
}

export async function logout() {
  await signOut()
  await chrome.storage.sync.set({ [chromeStorageKeys.gauthAccessToken]: null })
  await chrome.storage.sync.set({ [chromeStorageKeys.gauthRefreshToken]: null })
  await chrome.runtime.sendMessage({
    action: "logout",
    payload: {},
  });
}

export async function getCurrentUser() {
  // const { gauthAccessToken } = await getSupabaseAuthInfo()
  // if (!gauthAccessToken) return {}
  // const { data, error } = await supabase.auth.getUser(gauthAccessToken)
  // if (error) {
  //   // await logout()
  //   return {}
  // }
  // const { user } = data
  // return { user }

  return {}
}

export const getScrapeRecord = async (uuid: string) => {
  if (!uuid) {
    return []
  }

  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth() + 1; // 月份是从 0 开始计数的，所以加 1

  let nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  let nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  let startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01T00:00:00Z`;
  let endDate = `${nextMonthYear}-${nextMonth.toString().padStart(2, '0')}-01T00:00:00Z`;

  // const { data, error } = await supabase
  //   .from('scrape_record')
  //   .select('*')
  //   .eq('user_id', uuid)
  //   .gte('created_at', startDate)
  //   .lte('created_at', endDate);

  // if (error) {
  //   return []
  // }
  // return data ?? [];
  return []
};

export const createScraperRecord = async (user_id: string, data: { count: number, term: string, version?: string, email?: string }) => {
  if (!user_id) {
    return false
  }
  // const { count = 0, term = '', email = '', version = '' } = data
  // const { error } = await supabase.from("scrape_record").insert({
  //   user_id: user_id,
  //   count: count,
  //   term: term,
  //   email: email,
  //   version: version,
  //   is_download: false,
  // });
  // if (error) {
  //   return false
  // }
  return true
};

export const updateScraperRecord = async (user_id: string, is_download = true) => {
  if (!user_id) {
    return false
  }
  // 1. 获取用户最新的数据
  // const { data: latestRecord, error } = await supabase
  //   .from("scrape_record")
  //   .select("id")
  //   .eq("user_id", user_id)
  //   .order("created_at", { ascending: false })
  //   .limit(1);
  // if (error || !latestRecord || latestRecord.length === 0) {
  //   return false;
  // }

  // // 提取最新数据的 id
  // const latestRecordId = latestRecord[0].id;

  // // 2. 使用 id 更新 updated_at 字段
  // const { error: updateError } = await supabase
  //   .from("scrape_record")
  //   .update({
  //     is_download: is_download,
  //     updated_at: new Date(),
  //   })
  //   .eq("id", latestRecordId);
  // if (updateError) {
  //   return false;
  // }

  return true;
};

/** 是否会员 */
export const getUserRole = async (uuid: string) => {
  if (!uuid) {
    return false
  }
  // const { data = [], error } = await supabase.from('users').select('*').eq('id', uuid);

  // const user = data?.[0]

  // if (user && !user.ip) {
  //   console.log('en------');
  //   await updateUser(user.id)
  // }

  // // TODO, 且不过期
  // const currentDay = new Date().toISOString().slice(0, 10);
  // if (user?.membership_date && user?.membership_date >= currentDay) {
  //   return true
  // } else {
  //   return false
  // }

  return false

};

export const updateUser = async (id: string) => {
}

/** 抓取配置 */
export const getSysConfig = async () => {
  // const { data = [], error } = await supabase.from('sys_config').select('*').eq('is_open', true);
  // return data
  return []
};

/** 订阅管理 */
export const getSubLink = async (user_id: string) => {
  // const { data = [], error } = await supabase.from('user_payment_data').select('*').eq('user_id', user_id);
  // return data?.[0] || {}
  return {}
};

export const postData = async ({
  url,
  data
}: { url: string, data: any }) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    throw Error(res.statusText);
  }

  return res.json();
};


export const getMAM = async (data: { id: string, domains: string[] }) => {
  const res = await fetch(`https://www.Live Translator.com/api/getm?id=${data.id}&domains=${data.domains}`);

  if (!res.ok) {
    throw Error(res.statusText);
  }

  return res.json();
};

export const getMAM2 = async (data: { id: string, domains: string[] }) => {
  const res = await fetch('https://www.Live Translator.com/api/getm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return res.json();
};

// export const getMAM = async (arr) => {
//   const res = await sClient.emailsAndContacts(arr)
//   return res
// };
