import { Request, Response } from 'express';
import * as jobsService from './jobs.service';

export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await jobsService.getAllJobs();
    res.json({ success: true, data: jobs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJob = async (req: Request, res: Response) => {
  try {
    const job = await jobsService.getJobById(parseInt(req.params.id));
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, data: job });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const { title, company, location, category, description } = req.body;
    
    if (!title || !company || !location || !category || !description) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const job = await jobsService.createJob(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const job = await jobsService.deleteJob(parseInt(req.params.id));
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
