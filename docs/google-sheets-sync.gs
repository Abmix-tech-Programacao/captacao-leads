function sincronizarLeads() {
  const props = PropertiesService.getScriptProperties();

  const supabaseUrl = props.getProperty('SUPABASE_URL');
  const serviceRole = props.getProperty('SUPABASE_SERVICE_ROLE');

  const response = UrlFetchApp.fetch(
    supabaseUrl + '/rest/v1/leads?select=*&order=created_at.desc',
    {
      method: 'get',
      headers: {
        apikey: serviceRole,
        Authorization: 'Bearer ' + serviceRole
      },
      muteHttpExceptions: true
    }
  );

  if (response.getResponseCode() !== 200) {
    throw new Error(response.getContentText());
  }

  const leads = JSON.parse(response.getContentText());
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).clearContent();
  }

  const linhas = leads.map(lead => [
    lead.id || '',
    lead.name || '',
    lead.age || '',
    lead.email || '',
    lead.phone || '',
    lead.city || '',
    lead.notes || '',
    lead.source || '',
    lead.utm_source || '',
    lead.utm_medium || '',
    lead.utm_campaign || '',
    lead.consent || '',
    lead.created_at || '',
    lead.updated_at || ''
  ]);

  if (linhas.length > 0) {
    sheet.getRange(2, 1, linhas.length, 14).setValues(linhas);
  }
}
