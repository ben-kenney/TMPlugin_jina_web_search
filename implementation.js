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

async function jina_web_search(params, userSettings) {
  const { search_term, includeImages = false, importToChat = true } = params;
  const { jinaApiKey, gl, location } = userSettings;

  if (!search_term) {
    throw new Error('A search term is required');
  }

  // Construct the URL based on whether gl and location are set
  let url = `https://s.jina.ai/?q=${encodeURIComponent(search_term)}`;
  if (gl && location) {
    url += `&gl=${gl}&location=${location}`;
  } else if (location) {
    url += `&location=${location}`;
  } else if (gl) {
    url += `&gl=${gl}`;
  }
  console.log(`Fetching ${url}`);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jinaApiKey}`,
        //'X-Engine': 'direct',
        'X-Retain-Images': 'none',
        'X-With-Links-Summary': 'true',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get search results: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');

    let content;
    if (contentType && contentType.includes('application/json')) {
      content = await response.json();
    } else if (contentType && (contentType.includes('text/html') || contentType.includes('text/plain'))) {
      content = await response.text();
    } else {
      content = await response.blob();  // Handle binary data types or other formats
    }

    return content;

  } catch (error) {
    throw new Error(`An error occurred: ${error.message}`);
  }
}
