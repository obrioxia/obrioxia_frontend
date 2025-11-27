// Function to download the Log Receipt (The JSON file)
downloadReceipt(): void {
  if (!this.receipt) {
    return; // Safety check
  }

  // Convert the receipt object to a pretty JSON string
  const jsonString = JSON.stringify(this.receipt, null, 2);
  
  // Create a blob (a virtual file)
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create a link element, click it, and remove it
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  // Naming convention: obrioxia_receipt_[sequence_id].json
  a.download = `obrioxia_receipt_${this.receipt.sequence_id || 'new'}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
}
