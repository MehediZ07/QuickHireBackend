import { Request, Response } from 'express';
import * as vehicleService from './vehicles.service';

export const createVehicle = async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No data provided for vehicle creation'
    });
  }

  try {
    const vehicle = await vehicleService.createVehicle(req.body);

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    
    if (vehicles.length === 0) {
      return res.json({
        success: true,
        message: 'No vehicles found',
        data: []
      });
    }

    res.json({
      success: true,
      message: 'Vehicles retrieved successfully',
      data: vehicles
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getVehicleById = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  if (!vehicleId) {
    return res.status(400).json({
      success: false,
      message: 'Vehicle ID is required'
    });
  }

  try {
    const vehicle = await vehicleService.getVehicleById(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle retrieved successfully',
      data: vehicle
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  if (!vehicleId) {
    return res.status(400).json({
      success: false,
      message: 'Vehicle ID is required'
    });
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No data provided for update'
    });
  }

  try {
    const vehicle = await vehicleService.updateVehicle(vehicleId, req.body);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  if (!vehicleId) {
    return res.status(400).json({
      success: false,
      message: 'Vehicle ID is required'
    });
  }

  try {
    const deleted = await vehicleService.deleteVehicle(vehicleId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};