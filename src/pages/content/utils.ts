
export function remove_linebreak(s: string) {
  const two_line = /\n\n/g;
  const one_line = /\n/g;
  return s.replace(two_line, '').replace(one_line, '');
};

export function capitalize(s: string) {

  if (s && s.length > 0) {
    // Capitalize the first character and concatenate it with the rest of the sentence
    return (s.trimStart()).charAt(0).toUpperCase() + (s.trimStart()).slice(1);
  } else {
    // If the sentence is empty, return it as is
    return s;
  }

};


export function capitalizeSentences(transcription: string) {
  // Split the transcription into individual lines
  const lines = transcription.split('\n');

  // Iterate over each line
  for (let i = 0; i < lines.length; i++) {
    // Split each line by colon to separate startTimestamp and sentence
    const parts = lines[i].split(' : ');
    //console.log('parts[0] = ', parts[0]);
    //console.log('parts[1] = ', parts[1]);

    // If the line is in the correct format (startTimestamp : sentence)
    if (parts.length === 2) {
      // Capitalize the first character of the sentence
      const capitalizedSentence = (parts[1].trimStart()).charAt(0).toUpperCase() + (parts[1].trimLeft()).slice(1);

      // Replace the original sentence with the capitalized one
      lines[i] = parts[0] + ' : ' + capitalizedSentence;
      //console.log('i = ', i );
      //console.log('lines[i] = ', lines[i] );
    }
  }

  // Join the lines back into a single string and return
  //console.log('lines.join("\n") = ', lines.join('\n'));
  return lines.join('\n');
}


export function saveTranscript(timestamped_final_and_interim_transcript: BlobPart) {
  console.log('Saving all transcriptions');

  // Create a Blob with the transcript content
  const blob = new Blob([timestamped_final_and_interim_transcript], { type: 'text/plain' });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create an anchor element
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transcript.txt';

  // Programmatically click the anchor element to trigger download
  a.click();

  // Cleanup
  URL.revokeObjectURL(url);
}


export function saveTranslatedTranscript(timestamped_translated_final_and_interim_transcript: BlobPart) {
  console.log('Saving translated transcriptions');

  // Create a Blob with the transcript content
  const blob = new Blob([timestamped_translated_final_and_interim_transcript], { type: 'text/plain' });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create an anchor element
  const a = document.createElement('a');
  a.href = url;
  a.download = 'translated_transcript.txt';

  // Programmatically click the anchor element to trigger download
  a.click();

  // Cleanup
  URL.revokeObjectURL(url);
}


export function formatTimestamp(startTimestamp: Date) {
  // Convert startTimestamp to string
  const timestampString = startTimestamp.toISOString();

  // Extract date and time parts
  const datePart = timestampString.slice(0, 10);
  const timePart = timestampString.slice(11, 23);

  // Concatenate date and time parts with a space in between
  return `${datePart} ${timePart}`;
}


export function resetpause_timeout(recognition: any) {

}


export function containsColon(sentence: string) {
  // Check if the sentence includes the colon character
  return sentence.includes(':');
}


export function containsSpaceCharacter(sentence: string) {
  // Check if the sentence includes the colon character
  return sentence.includes('\%20');
}


export function regenerate_textarea() {
  // var textarea_rect = get_textarea_rect();

  // if (document.querySelector("#src_textarea_container")) {
  //   document.querySelector("#src_textarea_container")!.style!.fontFamily = src_selected_font + ", sans-serif";
  //   document.querySelector("#src_textarea_container")!.style!.width = String(textarea_rect.src_width) + 'px';
  //   document.querySelector("#src_textarea_container")!.style!.height = String(textarea_rect.src_height) + 'px';
  //   document.querySelector("#src_textarea_container")!.style!.top = String(textarea_rect.src_top) + 'px';
  //   document.querySelector("#src_textarea_container")!.style!.left = String(textarea_rect.src_left) + 'px';

  //   var src_textarea_container$ = $('<div id="src_textarea_container"><textarea id="src_textarea"></textarea></div>')
  //     .width(textarea_rect.src_width)
  //     .height(textarea_rect.src_height)
  //     .resizable().draggable({
  //       cancel: 'text',
  //       start: export function () {
  //         $('#src_textarea').focus();
  //       },
  //       stop: export function () {
  //         $('#src_textarea').focus();
  //       }
  //     })
  //     .css({
  //       'position': 'absolute',
  //       'fontFamily': src_selected_font + ', sans-serif',
  //       'fontSize': src_font_size,
  //       'color': src_font_color,
  //       'backgroundColor': hexToRgba(src_container_color, src_container_opacity),
  //       'border': 'none',
  //       'display': 'block',
  //       'overflow': 'hidden',
  //       'z-index': '2147483647'
  //     })
  //     .offset({ top: textarea_rect.src_top, left: textarea_rect.src_left })

  //   document.querySelector("#src_textarea").style.width = String(textarea_rect.src_width) + 'px';
  //   document.querySelector("#src_textarea").style.height = String(textarea_rect.src_height) + 'px';
  //   document.querySelector("#src_textarea").style.width = '100%';
  //   document.querySelector("#src_textarea").style.height = '100%';
  //   document.querySelector("#src_textarea").style.border = 'none';
  //   document.querySelector("#src_textarea").style.display = 'inline-block';
  //   document.querySelector("#src_textarea").style.overflow = 'hidden';

  //   document.querySelector("#src_textarea").style.fontFamily = src_selected_font + ", sans-serif";
  //   document.querySelector("#src_textarea").style.fontSize = String(src_font_size) + 'px';
  //   document.querySelector("#src_textarea").style.color = src_font_color;
  //   document.querySelector("#src_textarea").style.backgroundColor = hexToRgba(src_container_color, src_container_opacity);

  // } else {
  //   console.log('src_textarea_container has already exist');
  // }


  // if (document.querySelector("#dst_textarea_container")) {
  //   document.querySelector("#dst_textarea_container").style.fontFamily = dst_selected_font + ", sans-serif";
  //   document.querySelector("#dst_textarea_container").style.width = String(textarea_rect.dst_width) + 'px';
  //   document.querySelector("#dst_textarea_container").style.height = String(textarea_rect.dst_height) + 'px';
  //   document.querySelector("#dst_textarea_container").style.top = String(textarea_rect.dst_top) + 'px';
  //   document.querySelector("#dst_textarea_container").style.left = String(textarea_rect.dst_left) + 'px';

  //   var dst_textarea_container$ = $('<div id="dst_textarea_container"><textarea id="dst_textarea"></textarea></div>')
  //     .width(textarea_rect.dst_width)
  //     .height(textarea_rect.dst_height)
  //     .resizable().draggable({
  //       cancel: 'text',
  //       start: export function () {
  //         $('#dst_textarea').focus();
  //       },
  //       stop: export function () {
  //         $('#dst_textarea').focus();
  //       }
  //     })
  //     .css({
  //       'position': 'absolute',
  //       'fontFamily': dst_selected_font + ', sans-serif',
  //       'fontSize': dst_font_size,
  //       'color': dst_font_color.value,
  //       'backgroundColor': hexToRgba(dst_container_color, dst_container_opacity),
  //       'border': 'none',
  //       'display': 'block',
  //       'overflow': 'hidden',
  //       'z-index': '2147483647'
  //     })
  //     .offset({ top: textarea_rect.dst_top, left: textarea_rect.dst_left })

  //   document.querySelector("#dst_textarea").style.width = String(textarea_rect.dst_width) + 'px';
  //   document.querySelector("#dst_textarea").style.height = String(textarea_rect.dst_height) + 'px';
  //   document.querySelector("#dst_textarea").style.width = '100%';
  //   document.querySelector("#dst_textarea").style.height = '100%';
  //   document.querySelector("#dst_textarea").style.border = 'none';
  //   document.querySelector("#dst_textarea").style.display = 'inline-block';
  //   document.querySelector("#dst_textarea").style.overflow = 'hidden';

  //   document.querySelector("#dst_textarea").style.fontFamily = dst_selected_font + ", sans-serif";
  //   document.querySelector("#dst_textarea").style.fontSize = String(dst_font_size) + 'px';
  //   document.querySelector("#dst_textarea").style.color = dst_font_color.value;
  //   document.querySelector("#dst_textarea").style.backgroundColor = hexToRgba(dst_container_color, dst_container_opacity);

  // } else {
  //   console.log('dst_textarea_container has already exist');
  // }
}

var video_info;

export function getRect(element: Element) {
  const rect = element.getBoundingClientRect();
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;

  return {
    width: rect.width,
    height: rect.height,
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft
  };
}


export function getVideoPlayerInfo() {
  var elements = document.querySelectorAll('video, iframe');
  //console.log('elements = ',  elements);
  var largestVideoElement = null;
  var largestSize = 0;

  for (var i = 0; i < elements.length; i++) {
    var rect = getRect(elements[i]);

    //console.log('rect', rect);
    if (rect.width > 0) {
      var size = rect.width * rect.height;
      if (size > largestSize) {
        largestSize = size;
        largestVideoElement = elements[i];
      }
      var videoPlayer = elements[i];
      var videoPlayerContainer
      var container_rect, container_style, container_position, container_zIndex;
      if (videoPlayer) {
        // Check if the video player has a container
        videoPlayerContainer = videoPlayer.parentElement;
        while (videoPlayerContainer && videoPlayerContainer !== document.body) {
          var style = window.getComputedStyle(videoPlayerContainer);
          //if (style.position !== 'static') {
          //	break;
          //}
          videoPlayerContainer = videoPlayerContainer.parentElement;
        }

        // Default to the video player if no suitable container found
        if (!videoPlayerContainer || videoPlayerContainer === document.body) {
          videoPlayerContainer = videoPlayer as HTMLElement;
        }

        // Get the position and size of the container
        container_rect = getRect(videoPlayerContainer);
        // Get the computed style of the container
        container_style = window.getComputedStyle(videoPlayerContainer);
        // Check if position and z-index are defined, else set default values
        container_position = container_style.position !== 'static' ? container_style.position : 'relative';
        container_zIndex = container_style.zIndex !== 'auto' && container_style.zIndex !== '0' ? parseInt(container_style.zIndex) : 1;
      }

      return {
        element: elements[i],
        id: elements[i].id,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        position: (elements[i] as any).style.position,
        zIndex: (elements[i] as any).style.zIndex,
        container: videoPlayerContainer,
        container_id: videoPlayerContainer?.id,
        container_top: container_rect?.top,
        container_left: container_rect?.left,
        container_width: container_rect?.width,
        container_height: container_rect?.height,
        container_position: container_position,
        container_zIndex: container_zIndex,
      };
    }
  }
  //console.log('No video player found');
  return null;
}



export function getVideoPlayerId() {
  var elements = document.querySelectorAll('video, iframe');
  var largestVideoElement = null;
  var largestSize = 0;
  for (var i = 0; i < elements.length; i++) {
    if (getRect(elements[i]).width > 0) {
      var size = getRect(elements[i]).width * getRect(elements[i]).height;
      if (size > largestSize) {
        largestSize = size;
        largestVideoElement = elements[i].id;
      }
      return elements[i].id;
    }
  }
  // If no video player found, return null
  return null;
}

export function formatText(text: string) {
  // Replace URL-encoded spaces with regular spaces
  text = text.replace(/%20/g, ' ');

  // Match timestamps in the text
  const timestamps = text.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/g);

  if (timestamps) {
    // Split the text based on timestamps
    const lines = text.split(/(?=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/);

    let formattedText = "";
    for (let line of lines) {
      // Replace the separator format in the timestamps
      line = line.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}) *--> *(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/, '$1 --> $2');

      // Add the formatted line to the result
      formattedText += line.trim() + "\n";
    }

    return formattedText.trim(); // Trim any leading/trailing whitespace from the final result

  } else {
    return text;
  }
}




export const translate = async (t: string, src: string, dst: string) => {
  return new Promise((resolve, reject) => {
    const url = 'https://clients5.google.com/translate_a/single?dj=1&dt=t&dt=sp&dt=ld&dt=bd&client=dict-chrome-ex&sl='
      + src + '&tl=' + dst + '&q=' + encodeURIComponent(t);
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState === 4) {
        if (xmlHttp.status === 200) {
          try {
            let response = JSON.parse(xmlHttp.responseText);
            let translatedText = response.sentences.map((sentence: any) => sentence.trans).join('');
            resolve(translatedText);
          } catch (e) {
            reject('Error parsing response: ' + (e as any).message);
          }
        } else {
          reject('Request failed with status: ' + xmlHttp.status);
        }
      }
    };

    xmlHttp.open('GET', url, true);
    xmlHttp.send();
  });
};


export const gtranslate = async (t: string, src: string, dst: string) => {
  return new Promise((resolve, reject) => {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + src + '&tl=' + dst + '&dt=t&q=' + encodeURIComponent(t);
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState === 4) {
        if (xmlHttp.status === 200) {
          try {
            let response = JSON.parse(xmlHttp.responseText)[0];
            let translatedText = response.map((segment: any) => segment[0]).join('');
            resolve(translatedText);
          } catch (e) {
            reject('Error parsing response: ' + (e as any).message);
          }
        } else {
          reject('Request failed with status: ' + xmlHttp.status);
        }
      }
    };

    xmlHttp.open('GET', url, true);
    xmlHttp.send();
  });
};