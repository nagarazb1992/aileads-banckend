import { CsvImportJob } from '../models/CsvImportJob.js';
import { importCsvLeads } from '../services/csvImport.service.js';

// Simple polling worker for CSV import jobs
async function processCsvJobs() {
  while (true) {
    // Find one pending job
    const job = await CsvImportJob.findOne({ where: { status: 'UPLOADED' } });
    if (job) {
      try {
        // You may want to fetch orgId and mapping from job or related tables
        const orgId = job.getDataValue('org_id');
        const mapping = job.getDataValue('mapping'); // Adjust if mapping is stored elsewhere
        console.log(`Worker: Processing CSV import job ${job.id}`);
        await importCsvLeads(orgId, job.id, mapping);
      } catch (err) {
        console.error('Worker: Error processing CSV import job', err);
        await job.update({ status: 'FAILED' });
      }
    }
    // Wait before polling again
    await new Promise(res => setTimeout(res, 5000));
  }
}

processCsvJobs();
