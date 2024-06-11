import { useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { Loading, LoginPanel, StartScraper } from './components';
import { useCommonContext } from '../background/context/index'
import { formatTimestamp, saveTranscript, gtranslate, saveTranslatedTranscript, capitalize, formatText, containsColon } from './utils';

const timestamp_separator = ' --> ';

// Ensure compatibility with Web Speech API
let src_dialect = 'en-US' // zh-TW zh-CN
let src = src_dialect.split('-')[0];
let dst_dialect = 'zh-CN';
let dst = dst_dialect.split('-')[0];

let start_timestamp = Date.now();
let translate_time = Date.now();
let interim_transcript = ''

export default function getSpeech() {
  const [showId, setShowId] = useState(0)
  const { userData, loading } = useCommonContext()


  const init = () => {
    console.log('init -----', 'webkitSpeechRecognition' in window, 'SpeechRecognition' in window)
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Web Speech API is not supported by this browser. Please upgrade to Chrome version 25 or later.');
    } else {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = src_dialect;
      console.log('initrecognition -----', recognition)

      let recognizing = false;
      let final_transcript = '';
      let startTimestamp: string;
      let formatted_all_final_transcripts = '';
      let timestamped_final_and_interim_transcript = '';
      let session_end_time = '';
      let session_start_time = '';


      let pause_timeout: NodeJS.Timeout | null = null, pause_threshold = 5000; // 5 seconds artificial pause threshold;

      function resetpause_timeout() {
        pause_timeout && clearTimeout(pause_timeout);
        pause_timeout = setTimeout(function () {
          console.log("No speech detected for " + pause_threshold / 1000 + " seconds, stopping recognition");
          recognition.stop();
        }, pause_threshold);
      }
      recognition.onstart = () => {
        console.log('onstart -----',)

        final_transcript = '';
        interim_transcript = '';
        startTimestamp = formatTimestamp(new Date());
        resetpause_timeout();


        if (!recognizing) {
          const textarea_dom = document.querySelector("#src_textarea_container")
          const dst_dom = document.querySelector("#dst_textarea_container")
          if (textarea_dom) (textarea_dom as HTMLElement).style.display = 'none';
          if (dst_dom) (dst_dom as HTMLElement).style.display = 'none';

          console.log('recognition.onstart: stopping because recognizing =', recognizing);
          return;
        } else {
          console.log('recognition.onstart: recognizing =', recognizing);
          recognition.lang = src_dialect;
        }
      };

      recognition.onspeechstart = () => {
        console.log('recognition.onspeechstart: recognizing =', recognizing);
        final_transcript = '';
        interim_transcript = '';
        start_timestamp = Date.now();
        translate_time = Date.now();
      };

      recognition.onspeechend = () => {
        console.log('recognition.onspeechend: recognizing =', recognizing);
        final_transcript = '';
        interim_transcript = '';
        if (document.querySelector("#src_textarea_container")) (document.querySelector("#src_textarea_container") as HTMLElement).style.display = 'none';
        start_timestamp = Date.now();
        translate_time = Date.now();
      };

      recognition.onerror = (event: any) => {
        resetpause_timeout();
        if (document.querySelector("#src_textarea_container")) (document.querySelector("#src_textarea_container") as HTMLElement).style.display = 'none';
        if (document.querySelector("#dst_textarea_container")) (document.querySelector("#dst_textarea_container") as HTMLElement).style.display = 'none';

        if (event.error === 'no-speech') {
          console.log('recognition.no-speech: recognizing =', recognizing);
          if (document.querySelector("#src_textarea_container")) (document.querySelector("#src_textarea_container") as HTMLElement).style.display = 'none';
        }
        if (event.error === 'audio-capture') {
          alert('No microphone was found, ensure that a microphone is installed and that microphone settings are configured correctly');
          const icon_text_no_mic = 'NOMIC';
          chrome.runtime.sendMessage({ cmd: 'icon_text_no_mic', data: { value: icon_text_no_mic } });
          console.log('recognition.audio-capture: recognizing =', recognizing);
          if (document.querySelector("#src_textarea_container")) (document.querySelector("#src_textarea_container") as HTMLElement).style.display = 'none';
          if (document.querySelector("#dst_textarea_container")) (document.querySelector("#dst_textarea_container") as HTMLElement).style.display = 'none';
        }
        if (event.error === 'not-allowed') {
          if (Date.now() - start_timestamp < 100) {
            const icon_text_blocked = 'BLOCKED';
            chrome.runtime.sendMessage({ cmd: 'icon_text_blocked', data: { value: icon_text_blocked } });
            alert('Permission to use microphone is blocked, go to chrome://settings/contentExceptions#media-stream to change it');
          } else {
            const icon_text_denied = 'DENIED';
            chrome.runtime.sendMessage({ cmd: 'icon_text_denied', data: { value: icon_text_denied } });
            alert('Permission to use microphone was denied');
          }
          if (document.querySelector("#src_textarea_container")) (document.querySelector("#src_textarea_container") as HTMLElement).style.display = 'none';
          if (document.querySelector("#dst_textarea_container")) (document.querySelector("#dst_textarea_container") as HTMLElement).style.display = 'none';
          console.log('recognition.not-allowed: recognizing =', recognizing);
        }
      };

      recognition.onend = () => {
        final_transcript = '';
        interim_transcript = '';
        if (!recognizing) {
          console.log('recognition.onend: stopping because recognizing =', recognizing);

          session_end_time = formatTimestamp(new Date());
          console.log('session_end_time =', session_end_time);

          const t = formatted_all_final_transcripts + timestamped_final_and_interim_transcript;
          if (t) {
            const lines = t.trim().split('\n');
            const uniqueLines = [...new Set(lines)];

            let uniqueText: string | undefined;
            const newUniqueLines: string[] = [];
            const timestamps = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/;

            if (uniqueLines.length === 1 && uniqueLines[0] !== '' && uniqueLines[0] !== 'undefined') {
              const ts = uniqueLines[0].match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/g);
              if (!ts) {
                const lastUniqueLines = `${session_start_time} ${timestamp_separator} ${session_end_time} : ${uniqueLines[0]}`;
                console.log('lastUniqueLines = ', lastUniqueLines);
                uniqueLines[0] = lastUniqueLines;
                uniqueText = newUniqueLines.join('\n');
                uniqueText += '\n';
              }
            } else if (uniqueLines.length > 1 && uniqueLines[uniqueLines.length - 1] !== '' && !timestamps.test(uniqueLines[uniqueLines.length - 1])) {
              const lastUniqueLines = `${startTimestamp} ${timestamp_separator} ${session_end_time} : ${uniqueLines[uniqueLines.length - 1]}`;
              console.log('lastUniqueLines = ', lastUniqueLines);
              uniqueLines[uniqueLines.length - 1] = lastUniqueLines;
              for (let i = 0; i < uniqueLines.length; i++) {
                newUniqueLines.push(uniqueLines[i]);
              }
              console.log('newUniqueLines = ', newUniqueLines);
              uniqueText = newUniqueLines.join('\n');
              uniqueText += '\n';
            } else if (uniqueLines.length > 1 && uniqueLines[uniqueLines.length - 1] !== '' && timestamps.test(uniqueLines[uniqueLines.length - 1])) {
              uniqueText = uniqueLines.join('\n');
              uniqueText += '\n';
            }

            if (uniqueText) saveTranscript(uniqueText);

            if (uniqueText) {
              gtranslate(uniqueText, src, dst).then((result: any) => {
                result = result.replace(/(\d+),(\d+)/g, '$1.$2');
                result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/g, 'Timestamp: $1 --> $2');

                saveTranslatedTranscript(result);

                const timestamped_translated_final_and_interim_transcript = result;
              });
            }
          }
        }
      };

      recognition.onresult = (event: any) => {
        let interim_transcript = '';
        if (typeof (event.results) === 'undefined') {
          recognition.onend = null;
          recognition.stop();
          console.log('recognition.onresult: event.results undefined');
          return;
        }
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
          } else {
            interim_transcript += event.results[i][0].transcript;
          }
        }
        final_transcript = capitalize(final_transcript);
        console.log('recognition.onresult: final_transcript =', final_transcript);

        const currentTime = formatTimestamp(new Date());
        const formattedFinalTranscript = formatText(final_transcript);

        const final_lines = formattedFinalTranscript.split('\n');
        const currentStartTime = final_lines.length ? final_lines[0].split(' ')[0] : '';
        const currentEndTime = final_lines.length ? final_lines[final_lines.length - 1].split(' ')[0] : '';

        if (formattedFinalTranscript && !containsColon(formattedFinalTranscript) && currentStartTime && currentEndTime) {
          const currentFinalTranscriptWithTimestamp = `${currentStartTime} ${timestamp_separator} ${currentEndTime} : ${formattedFinalTranscript}`;
          console.log('recognition.onresult: currentFinalTranscriptWithTimestamp =', currentFinalTranscriptWithTimestamp);
        }

        const interim_lines = interim_transcript.split('\n');
        const currentInterimStartTime = interim_lines.length ? interim_lines[0].split(' ')[0] : '';
        const currentInterimEndTime = interim_lines.length ? interim_lines[interim_lines.length - 1].split(' ')[0] : '';

        if (interim_transcript && !containsColon(interim_transcript) && currentInterimStartTime && currentInterimEndTime) {
          const currentInterimTranscriptWithTimestamp = `${currentInterimStartTime} ${timestamp_separator} ${currentInterimEndTime} : ${interim_transcript}`;
          console.log('recognition.onresult: currentInterimTranscriptWithTimestamp =', currentInterimTranscriptWithTimestamp);
        }
      };

      // Other functions and event handlers are converted similarly
    }

  }


  useEffect(() => {
    init()
  }, [])

  return (
    <Draggable>
      {/* <div className="relative rounded-lg border border-gray-200 bg-white shadow-lg">
        {showId == 0 && <Loading />}
        {showId == 1 && <LoginPanel />}
        {showId == 2 && <StartScraper />}
      </div> */}
      <div className='text-white'>dddddd7sdfg</div>
    </Draggable>
  );
}
