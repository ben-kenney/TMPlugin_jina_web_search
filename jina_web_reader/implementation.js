async function jina_web_reader(params, userSettings) {
  const { url, includeImages = false, importToChat = true } = params;
  const { jinaApiKey } = userSettings;

  if (!url) {
    throw new Error('URL is required');
  }

  try {
    const response = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jinaApiKey}`,
        'X-With-Links-Summary': 'true',
        'X-Retain-Images': includeImages.toString()
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.statusText}` );
    }

    const contentType = response.headers.get('content-type');

    let content;
    if (contentType.includes('application/json')) {
      content = await response.json();
    } else if (contentType.includes('text/html') || contentType.includes('text/plain')) {
      content = await response.text();
    } else {
      content = await response.blob();  // Handle binary data types or other formats
    }

    return content;

  } catch (error) {
    throw new Error(`An error occurred: ${error.message}`);
  }
}
