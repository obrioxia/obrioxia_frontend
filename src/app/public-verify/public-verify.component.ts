  // --- PROOF GENERATION (IMPROVED) ---
  downloadProof() {
    if (!this.results) return;

    // Check if any record in the results is valid
    const isVerified = this.results.some(r => r.valid === true);

    const proofData = {
      recordType: "OBRIOXIA_VERIFICATION_PROOF",
      timestamp_verified: new Date().toISOString(),
      status: isVerified ? "VERIFIED" : "FAILED", // ✅ Clear Status
      integrity_check: "COMPLETE",
      verification_details: {
        total_records_checked: this.results.length,
        valid_records_found: this.results.filter(r => r.valid).length
      },
      raw_results: this.results
    };

    const filename = `proof_${isVerified ? 'valid' : 'failed'}_${new Date().getTime()}.json`;
    this.triggerDownload(proofData, filename);
  }
