import fs from 'fs';
import csv from 'csv-parser';
import { CsvImportJob } from '../models/CsvImportJob.js';
import { Membership } from '../models/membership.model.js';
import { importCsvLeads } from '../services/csvImport.service.js';

export async function uploadCsv(req: any, res: any) {
  const membership = await Membership.findOne({ where: { user_id: req.user.userId } });
    let orgId = membership ? membership.getDataValue('organization_id') : undefined;
  const file = req.file;


  if (!file) {
    return res.status(400).json({ message: 'CSV file required' });
  }

  const job = await CsvImportJob.create({
    org_id: orgId,
    file_path: file.path
  });

  res.json({
    jobId: job.id,
    status: 'UPLOADED'
  });
}

export async function previewCsv(req: any, res: any) {
  const { jobId } = req.params;

  const job = await CsvImportJob.findByPk(jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  const rows: any[] = [];

  fs.createReadStream(job.getDataValue('file_path'))
    .pipe(csv())
    .on('data', (data) => {
      if (rows.length < 5) rows.push(data);
    })
    .on('end', () => {
      res.json({
        headers: Object.keys(rows[0] || {}),
        preview: rows
      });
    });
}

export async function importCsv(req: any, res: any) {
  const membership = await Membership.findOne({ where: { user_id: req.user.userId } });
  let orgId = membership ? membership.getDataValue('organization_id') : undefined;
  const { jobId } = req.params;
  const { mapping } = req.body;

  if (!mapping) {
    return res.status(400).json({ message: 'CSV mapping is required in the request body.' });
  }

  await importCsvLeads(orgId, jobId, mapping);

  res.json({
    message: 'CSV import started'
  });
}
