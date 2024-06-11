import React, { useEffect, useState, useRef } from 'react';
import { BsStopCircleFill } from 'react-icons/bs'
import { geTag, sleep } from "./parse"
import { exportFile, exportExcelFile } from "./export"
import { createScraperRecord, getMAM, getMAM2, updateScraperRecord, } from '../../background';
import { useCommonContext } from '../../background/context/index';
import { ConfigProps, getConfig, getProConfig } from '../../background/config'
import { GHeader } from "./Header"
import { SubscribeModal } from "./pricing"
import { IMapDataWithFormat } from './typings';

const search_box_input_tag = '#maps_sb'
const search_button = "#searchbox-searchbutton"
const list_scroller_tag = ".w6VYqd .m6QErb.DxyBCb.kA9KIf.dS8AEf.ecceSd[aria-label]"
const end_span = ".HlvSq"

const listClz = ".b_vList";
const listItemClz = "li a";
const listLoadingClz = ".bm_waitlayer";
const listNextClz = "a.bm_rightChevron";
const listParentClz = ".entity-listing-container";

const dataLen = 60
const groupSize = 6; // 每组的大小

// 假设环境变量和函数已定义
let results: any[] = []; // 存储提取的数据
// let isFinding = true; // 控制是否继续查找
let isLoadingMore = false; // 控制是否正在加载更多数据
let uniqueIds = new Set(); // 存储唯一的ID，避免重复

let keyword = ''

export const StartScraper = () => {
  const { userData, isPro, recordTotal, amount, version, limit } = useCommonContext()
  const [isShowSub, setIsShowSub] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [text, setText] = useState('Start Scraper');
  // init | start | pause | stop | error
  const [scrapeState, setScrapeState] = useState('init');
  const [allData, setAllData] = useState<any[]>([]);
  const [config, setConfig] = useState<ConfigProps[]>([]);
  const [proConfig, setProConfig] = useState<ConfigProps[]>([]);
  const [selectedExportFormat, setSelectedExportFormat] = useState('csv')
  const scrapeStateRef = useRef(scrapeState);

  useEffect(() => {
    scrapeStateRef.current = scrapeState;
  }, [scrapeState]);

  const getUserConfig = async () => {
    const fileConfig = await getConfig()
    setConfig(fileConfig)
    const fileProConfig = await getProConfig()
    setProConfig(fileProConfig)
  }

  useEffect(() => {
    getUserConfig()
  }, [])

  useEffect(() => {
    if (allData.length > 0 && scrapeState !== 'stop') {
      setText(`Scraping ${allData.length} records...`);
    }
  }, [allData])

  const openSubscribe = () => {
    setIsShowSub(true)
  }

  // 导出
  const exportData = async () => {
    try {
      if (!userData?.id || exportLoading) {
        return
      }
      setExportLoading(true)
      if (isPro) {
        if (allData.length) {
          await processQueue(allData);
        }
        // 洗一下数据
        const formatData: Array<IMapDataWithFormat> = []
        try {
          // 首先，找出所有可能的媒体键
          const allMediaKeys = new Set<string>();
          allData.forEach(item => {
            const medias = item['Social Medias']?.split(',') || [];
            medias?.forEach((media: any) => {
              const [key] = media.split(':');
              if (key) {
                allMediaKeys.add(key);
              }
            });
          });

          allData.forEach(item => {
            const obj: IMapDataWithFormat = {
              ...item,
              "Plus Code": item["Plus Code"],
              "Email": item["Email"],
            }
            allMediaKeys.forEach((key: string) => {
              obj[key] = ''; // 初始化所有媒体键为默认空字符串
            });
            const medias = item['Social Medias']?.split(',') || []
            medias?.forEach((media: string) => {
              const [m, ...v] = media?.split(':');
              if (m) {
                obj[m] = v.join(":") || ''
              }
            })
            formatData.push(obj)
          })
        } catch (error) {
          console.log('catcherr', error);
        }
        if (selectedExportFormat === 'excel') {
          exportExcelFile(formatData, formatData.length, keyword)
        } else {
          exportFile(formatData, formatData.length, keyword)
        }
      } else {
        const allDataWithTip = [...allData, { Name: `Live Translate exports only ${limit || 15} records on a free plan.` }]
        if (selectedExportFormat === 'excel') {
          exportExcelFile(allDataWithTip, allData.length, keyword)
        } else {
          exportFile(allDataWithTip, allData.length, keyword)
        }
      }
      await updateScraperRecord(userData.id)
      setExportLoading(false)

      results = []; // 存储提取的数据
      isLoadingMore = false; // 控制是否正在加载更多数据
      uniqueIds = new Set(); // 存储唯一的ID，避免重复
    } catch (error) {
      setExportLoading(false)
    }
  }

  const spliceMAM = async (dataChunk: any[]) => {
    if (!isPro) return [];

    const isec = proConfig.find(item => item.name === 'Email')?.check;
    const ismc = proConfig.find(item => item.name === 'Social Medias')?.check;

    if (isec || ismc) {
      const arr = dataChunk.map(item => item.Domain).filter(Boolean);
      const getMRes = await getMAM2({
        id: userData.id,
        domains: arr,
      });
      const data = getMRes.data;

      return dataChunk.map(allItem => {
        const target = data[allItem.Domain];
        return target ? {
          ...allItem,
          Email: isec ? target.emails : '',
          "Social Medias": ismc ? target.medias : '',
        } : allItem;
      });
    }

    return dataChunk;
  };

  // 辅助函数来分割数组
  const chunkArray = (array: any[], size: number) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      const chunk = array.slice(i, i + size);
      result.push(chunk);
    }
    return result;
  };

  const processSettledResults = (results: PromiseSettledResult<any[]>[]) => {
    return results
      .filter(result => result.status === 'fulfilled')
      // @ts-ignore
      .map(result => result.value)
      .flat();
  };

  const mergeIntoAllData = (updatedData: any[]) => {
    // 将 updatedData 中的元素合并到 allData 中
    // 这里需要根据您的具体需求来实现合并逻辑
    updatedData.forEach(item => {
      const index = allData.findIndex(it => it.Domain === item.Domain);
      if (index >= 0) {
        allData.splice(index, 1, item);
      } else {
        allData.push(item);
      }
    });
    setAllData([...allData]); // 假设 setAllData 是更新状态的函数
  };


  const processQueue = async (data: any[]) => {
    if (!isPro) return;

    try {
      if (data.length <= dataLen) {
        const groups = chunkArray(data, groupSize);
        const promises = groups.map(group => spliceMAM(group));

        const results = await Promise.allSettled(promises);
        const updatedData = processSettledResults(results);
        mergeIntoAllData(updatedData);
      } else {
        for (let i = 0; i < data.length; i += dataLen) {
          const chunk = data.slice(i, i + dataLen);
          await processQueue(chunk);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const startAction = async () => {
    let search = ''
    const searchInput = document.querySelector(search_box_input_tag)
    if (searchInput instanceof HTMLInputElement) {
      search = searchInput.value;
    }
    keyword = search
    if (!keyword) return
    // 1. 手动点击搜索
    await clickSearchBtn()
    // 2. 循环抓取过程
    await scraperProcess()
  }

  /** 手动点一下搜索按钮 */
  async function clickSearchBtn() {
    setScrapeState('start')
  }

  function extractDomain(url: string) {
    if(!url) return ''
    const regex = /https?:\/\/(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  }


  const getDataByDoms = async () => {
    let elements = document.querySelectorAll(".b_vList");
    if (!elements || elements.length <= 0)
      return;

    let lastElement = elements[elements.length - 1];
    let items = lastElement.querySelectorAll("li a") as NodeListOf<HTMLElement>;

    if (items.length > 0) {
      items.forEach((item) => {
        // 1. 是不是会员，如果不是，一次只能抓 15 条
        if (!isPro && results.length >= 15) {
          return results
        }
        // 2. 判断剩余额度是否大于当前额度
        const rest = amount - recordTotal
        if (rest < results.length) {
          return results
        }

        let dataset = item.dataset.entity as any;
        try {
          dataset = JSON.parse(dataset);
        } catch (error) {
          console.log('data error')
        }
        let data = dataset?.entity || {};
        let routablePoint = dataset?.routablePoint || {};

        if (data && data.title && !uniqueIds.has(data.title)) {
          uniqueIds.add(data.title);

          const latitude = routablePoint?.latitude || "";
          const longitude = routablePoint?.longitude || "";

          let bingMapUrl = data.title && data.address && latitude && longitude
            ? `https://www.bing.com/maps?cp=${latitude}~${longitude}&lvl=17.0&q=${encodeURIComponent(data.title + " , " + data.address)}`
            : "";


          results.push({
            Name: data.title || "",
            Address: data.address || "",
            "Featured image": data.imageUrl || "",
            "Live Translate URL": bingMapUrl,
            Latitude: latitude,
            Longitude: longitude,
            Website: data.website || "",
            Domain: extractDomain(data.website) || "",
            Phone: data.phone || ""
          });
        }
      });
    }
    // 检查加载更多
    let loadingElements = document.querySelectorAll(".bm_waitlayer");
    // console.log("loadingElements:", loadingElements.length)
    if (loadingElements.length > 0 && window.getComputedStyle(loadingElements[loadingElements.length - 1]).getPropertyValue("display") === "block") {
      isLoadingMore = true;
    } else {
      isLoadingMore = false;
    }

    // console.log("isLoadingMore:", isLoadingMore)
    // 检查翻页元素
    if (!isLoadingMore) {
      let parentElement = document.querySelector(".entity-listing-container") as HTMLElement;
      let nextPageElement = parentElement ? parentElement.querySelector("a.bm_rightChevron") as HTMLElement : null;

      if (nextPageElement && nextPageElement.style.display !== "none") {
        isLoadingMore = true;
        nextPageElement.click(); // 模拟点击翻页
        await sleep(2000) // 
        await getDataByDoms();
      }
    }

    // if (isLoadingMore) {
    //   console.log("For more results, simply drag the map to a new location.");
    //   isLoadingMore = false;
    // }

    return results
  }

  /** 抓取过程 */
  const scraperProcess = async () => {
    // console.log('scraperProcess');
    // 1. 抓取数据
    const mData = await getDataByDoms();
    // console.log('scraperProcess end', mData);
    // 2. 全部抓完, 改变抓取状态，准备导出
    await changeToStop();
    // 3. 清洗数据
    if (mData) {
      await formatData(mData)
    }
  }

  /** 清洗数据 */
  const formatData = async (mapDataArr: any[]) => {
    mapDataArr.map(mData => {
      const formatDataObject: Partial<IMapDataWithFormat> = {
        Name: mData.Name,
        Fulladdress: mData.Address,
        Phone: mData.Phone,
        "Live Translate URL": mData["Live Translate URL"],
        Latitude: mData.Latitude,
        Longitude: mData.Longitude,
        Website: mData.Website,
        Domain: mData.Domain,
        "Email": "visible after upgrade",
        "Social Medias": 'visible after upgrade',
      }

      const result: Record<string, any> = {}

      Object.keys(config).map(index => {
        const i = Number(index)
        if (config[i].check) {
          result[config[i].name] = formatDataObject[config[i].name]
        }
      })
      Object.keys(proConfig).map(index => {
        const i = Number(index)
        if (proConfig[i].check) {
          result[proConfig[i].name] = formatDataObject[proConfig[i].name]
        }
      })

      if (isPro) {
        const proData: Partial<IMapDataWithFormat> = {
          "Email": '',
          "Social Medias": '',
        }
        Object.keys(proConfig).map(index => {
          const i = Number(index)
          if (proConfig[i].check) {
            result[proConfig[i].name] = proData[proConfig[i].name]
          }
        })
      }
      allData.push(result)
      setAllData([...allData])

    })
  }

  async function changeToStop() {
    setText('Scraping Completed');
    setScrapeState('stop')

    const result = await createScraperRecord(userData.id, {
      term: keyword,
      count: allData.length,
      version: version,
      email: userData.email,
    })
    if (!result) {
      console.log("happen error", result);
    }
  }

  const renderStop = () => {
    return <div className='flex flex-col items-center cursor-pointer' onClick={() => setScrapeState('stop')}>
      <BsStopCircleFill size={20} color='rgb(37,99,235,0.8)' />
      {/* <span xt-marked="ok">Stop</span> */}
    </div>
  }

  const renderInit = () => {
    return <>
      <img src={chrome.runtime.getURL('/icons/quick-start.png')} className='w-[107px] h-[75px] mb-[10px] flex-shrink-0' />
      <div className='flex flex-col flex-grow w-full' onClick={() => startAction()}>
        <button aria-label="Start" className='bg-blue-600 inline-flex items-center justify-center hover:bg-blue-700 text-white text-base font-bold py-2 px-4 rounded'>
          {/* @ts-ignore: svg */}
          <svg t="1689532479101" class="h-4 w-4" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12799" width="200" height="200"><path d="M1024 320h-128V192H544V64h-64v128H128v128H0v320h128v128h224l-96 192h512l-96-192h224v-128h128V320zM64 576v-192h64v192H64z m768 128H192V256h640v448z m128-128h-64v-192h64v192zM256 640h512V320H256v320z m64-256h64v64h-64v-64z m320 0h64v64h-64v-64z m-64 192h-128v-64h128v64z" p-id="12800" fill="#ffffff"></path></svg>
          <span className='ml-1'>Start Scraper</span>
        </button>
      </div>
    </>
  }

  /** scraping includes start | pause */
  const renderScraping = () => {
    return <div className='flex flex-col flex-grow mt-[20px] w-full'>
      <div aria-label="Scraping" className='flex items-center justify-center bg-gray-400 text-white text-base font-bold py-2 px-4 rounded'>
        <span className={`inline-block h-[14px] w-[14px] mr-[6px] animate-spin rounded-full border-2 border-[#5d9a8c] border-t-transparent`} />
        <span style={{ whiteSpace: 'pre-line' }}>{text}</span>
      </div>
      <div className='text-xs text-gray-400 mt-[6px] text-center'>Please wait a moment</div>
      <div className="flex items-center justify-evenly mt-[16px]">
        {/* {scrapeState === 'pause' ? renderResume() : renderPause()} */}
        {renderStop()}
      </div>
    </div>
  }

  const resetData = () => {
    setAllData([])
    setScrapeState('init')
    setText('Start Scraper')
    // console.log(allData.length, '-------')
    results = []; // 存储提取的数据
    isLoadingMore = false; // 控制是否正在加载更多数据
    uniqueIds = new Set(); // 存储唯一的ID，避免重复
  }

  const renderEnd = () => {
    return <>
      <div aria-label="Scraping" className='flex flex-col items-center justify-center mt-[10px] w-full py-[10px] text-base rounded relative'>
        {exportLoading && <div className={`absolute w-full  top-0 ${isPro ? 'h-[160px]' : 'h-[210px]'}`}>
          <div className='rounded-md' style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(151, 151, 151, 0.9)' }} />
          <span className={`absolute top-0 left-0 right-0 bottom-0 m-auto inline-block h-[40px] w-[40px] animate-spin rounded-full border-4 border-[#fff] border-t-transparent`} />
          <span className='absolute bottom-[10px] right-0 left-0 flex flex-col'>
            <span className='text-xs text-white text-center'>Exporting...</span>
            <span className='text-xs text-white mt-[6px] text-center'>Please wait a moment</span>
          </span>
        </div>}
        <span style={{ whiteSpace: 'pre-line' }} className='font-bold py-2 px-4 '>{text}</span>
        {isPro ? null : <>
          <span className='text-sm' style={{ whiteSpace: 'pre-line' }}>Free account can only export 15 results.</span>
          <span className='mt-[10px] text-blue-500 cursor-pointer inline-flex justify-center items-center' onClick={() => openSubscribe()}>
            {/* @ts-ignore: svg */}
            <svg t="1689417228143" class="w-6 h-6" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8069" width="200" height="200"><path d="M594.610979 817.742673a20.380379 20.380379 0 0 0-20.380379 20.380379v81.731115a20.380379 20.380379 0 0 0 40.760758 0v-81.731115a20.380379 20.380379 0 0 0-20.380379-20.380379zM446.128883 815.276808a20.380379 20.380379 0 0 0-20.429697 20.417367v81.731115a20.380379 20.380379 0 0 0 40.760758 0v-81.731115a20.380379 20.380379 0 0 0-20.331061-20.417367z" fill="#386ED3" p-id="8070"></path><path d="M501.549212 817.742673m20.380379 0l0 0q20.380379 0 20.380379 20.380379l0 165.496569q0 20.380379-20.380379 20.380379l0 0q-20.380379 0-20.380379-20.380379l0-165.496569q0-20.380379 20.380379-20.380379Z" fill="#386ED3" p-id="8071"></path><path d="M768.454502 438.098009S793.236451 164.978737 515.308742 0c0 0-252.307366 130.185373-252.307367 438.098009 0 0-233.985985 171.205047 31.094565 346.281503l53.607918-81.065331 70.43745 81.842079h195.160932l70.43745-81.842079 38.048306 81.718786 81.657139-81.657139s139.752932-145.510728-34.990633-265.277819z m-247.240012 51.413297a110.963951 110.963951 0 1 1 110.963951-110.963951 110.963951 110.963951 0 0 1-110.963951 110.963951z" fill="#386ED3" p-id="8072"></path></svg>
            <span>Upgrade Now</span>
          </span>
        </>}
      </div>
      <div className='flex flex-col flex-grow mb-[10px] mt-[10px] w-full' onClick={() => exportData()}>
        <button aria-label="Export Scraping Data" className='bg-blue-600 hover:bg-blue-700 text-white text-base font-bold py-2 px-4 rounded'>
          {exportLoading ? 'Please wait a moment.' : `Export Lead List - ${allData.length}`}
        </button>
      </div>
      <div className='w-full mb-[10px] flex justify-center items-center'>
        <div className='text-[12px]'>
          <label className='mr-[12px] inline-flex items-center'>
            <input className='mr-[6px]' type="radio" value="csv" checked={selectedExportFormat === "csv"} onChange={(e) => setSelectedExportFormat(e.target.value)} />
            CSV
          </label>
          <label className=' inline-flex items-center'>
            <input className='mr-[6px]' type="radio" value="excel" checked={selectedExportFormat === "excel"} onChange={(e) => setSelectedExportFormat(e.target.value)} />
            Excel
          </label>
        </div>
        <button aria-label="Reset" className='ml-auto border text-right border-solid border-red-600 text-red-600 text-xs py-1 px-2 rounded' onClick={() => resetData()}>
          Reset
        </button>
      </div>
    </>
  }

  const renderFooter = () => {
    return <div className='flex w-full justify-between text-gray-300 text-xs'>
      <span>v{version}</span>
      <a target='_blank' href="https://www.Live Translator.com">Live Translator.com</a>
      {/* <span> {'>'} </span> */}
    </div>
  }

  return (
    isShowSub ? <div className="absolute bg-white px-[20px] py-[20px]">
      <SubscribeModal onClose={() => setIsShowSub(false)} />
    </div> : <div className='px-2 py-2'>
      <GHeader open={() => openSubscribe()} isLogin={!!userData?.id} isPro={isPro} />
      <div className='flex flex-col w-full items-center mb-3' style={{ justifyContent: 'center' }}>
        {scrapeState === 'init' && renderInit()}
        {['start', 'pause'].includes(scrapeState) && renderScraping()}
        {scrapeState === 'stop' && renderEnd()}
      </div>
      {renderFooter()}
    </div>
  )
}