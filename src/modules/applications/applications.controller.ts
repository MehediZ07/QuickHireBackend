import { Request, Response } from 'express';
import * as applicationsService from './applications.service';

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const createApplication = async (req: Request, res: Response) => {
  try {
    const { jobId, name, email, resumeLink, coverNote } = req.body;
    
    if (!jobId || !name || !email || !resumeLink) {
      return res.status(400).json({ success: false, message: 'Job ID, name, email, and resume link are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (!isValidUrl(resumeLink)) {
      return res.status(400).json({ success: false, message: 'Invalid resume link URL' });
    }

    const application = await applicationsService.createApplication(req.body);
    res.status(201).json({ success: true, data: application, message: 'Application submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
