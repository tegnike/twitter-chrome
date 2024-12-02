console.log('%c[Tweet Tracker] Content script loaded', 'color: blue; font-weight: bold');

const SUPABASE_URL = '';
const SUPABASE_KEY = '';



async function saveToSupabase(postData) {
  console.log('%c[Tweet Tracker] Saving tweet...', 'color: blue; font-weight: bold');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/my_tweets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.log('%c[Tweet Tracker] ERROR:', 'color: red; font-weight: bold', errorData);
      throw new Error(errorData);
    }

    const responseData = await response.text();
    if (responseData) {
      console.log('%c[Tweet Tracker] Success!', 'color: green; font-weight: bold');
      return JSON.parse(responseData);
    } else {
      console.log('%c[Tweet Tracker] No response data', 'color: yellow; font-weight: bold');
      return null;
    }
  } catch (error) {
    console.log('%c[Tweet Tracker] FATAL ERROR:', 'color: red; font-size: 14px; font-weight: bold', error.message);
    throw error;
  }
}

function interceptTweetSubmission() {
  document.addEventListener('click', async (e) => {
    const button = e.target.closest('button[data-testid="tweetButton"]');
    if (!button) return;
    
    console.log('%c[Tweet Tracker] Tweet button found and clicked', 'color: blue; font-weight: bold');
    
    try {
      const tweetTextElement = document.querySelector('[data-testid="tweetTextarea_0"]');
      if (tweetTextElement && (
        tweetTextElement.closest('[data-testid="inline_reply_offscreen"]') ||
        document.querySelector('[role="dialog"][aria-modal="true"]')?.textContent.includes('返信先')
      )) {
        console.log('%c[Tweet Tracker] Reply detected - skipping', 'color: yellow; font-weight: bold');
        return;
      }
      const tweetText = tweetTextElement ? tweetTextElement.innerText : '';
      if (!tweetText) {
        console.log('%c[Tweet Tracker] No tweet text found', 'color: yellow; font-weight: bold');
        return;
      }
      console.log('%c[Tweet Tracker] Tweet text:', 'color: blue; font-weight: bold', tweetText);
      const quotedTextElement = document.querySelector('[data-testid="attachments"] [data-testid="tweetText"]')?.textContent;
      if (quotedTextElement) {
        console.log('%c[Tweet Tracker] Quoted text found:', 'color: blue; font-weight: bold', quotedTextElement);
      }
      await saveToSupabase({
        text: tweetText,
        quoted_text: quotedTextElement || null,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.log('%c[Tweet Tracker] Error saving tweet:', 'color: red; font-weight: bold', error);
    }
  });
}

interceptTweetSubmission();
