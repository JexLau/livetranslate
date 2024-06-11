import Papa from 'papaparse';
import { WorkBook, utils, write } from 'xlsx';
import { IMapDataWithFormat } from './typings';

function formatKeyword(input: string) {
  // 移除字符串两端的空格
  const trimmedInput = input.trim();

  // 只保留前10个字符
  const truncatedInput = trimmedInput.slice(0, 10);

  // 用短划线代替空格
  const formattedInput = truncatedInput.replace(/\s+/g, '-');

  return formattedInput;
}

export const exportFile = (allData: IMapDataWithFormat[], length: number, keyword: string) => {
  // keyword保留10个字符，如果有空格就用-代替
  const word = formatKeyword(keyword)

  // Convert the allData array to a CSV string
  const csv = Papa.unparse(allData);

  // Create a Blob from the CSV string
  const blob = new Blob([csv], { type: 'text/csv; charset=UTF-8' });

  // Create a URL representing the Blob
  const url = URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement('a');

  // Set the href and download attributes of the link
  link.href = url;
  // Get the current year, month, and day
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  link.download = `${length}-Records-${word}-${year}${month}${day}${hour}${min}.csv`
  // Append the link to the body
  document.body.appendChild(link);

  // Simulate a click on the link
  link.click();

  // Remove the link from the body
  document.body.removeChild(link);

}

// 将字符串转ArrayBuffer
function s2ab(s: string) {
  const buf = new ArrayBuffer(s.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i != s.length; ++i) {
    view[i] = s.charCodeAt(i) & 0xff
  }
  return buf
}

// 将workbook装化成blob对象
function workbook2blob(workbook: WorkBook) {
  // 生成excel的配置项
  const wbout = write(workbook, {
    // 要生成的文件类型
    bookType: 'xlsx',
    // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    bookSST: false,
    // 二进制类型
    type: 'binary'
  })
  const blob = new Blob([s2ab(wbout)], {
    type: 'application/octet-stream'
  })
  return blob
}

export const exportExcelFile = (allData: IMapDataWithFormat[], length: number, keyword: string) => {
  try {
    // keyword保留10个字符，如果有空格就用-代替
    const word = formatKeyword(keyword)
    // 导出为Excel
    const worksheet = utils.json_to_sheet(allData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, word);
    // 创建工作薄blob
    const blob = workbook2blob(workbook)

    // Create a URL representing the Blob
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');

    // Set the href and download attributes of the link
    link.href = url;
    // Get the current year, month, and day
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    link.download = `${length}-Records-${word}-${year}${month}${day}${hour}${min}.xlsx`
    // Append the link to the body
    document.body.appendChild(link);

    // Simulate a click on the link
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);

  } catch (error) {
    console.log('=======', error);
  }

}