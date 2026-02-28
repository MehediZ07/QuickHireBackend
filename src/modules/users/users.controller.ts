import { Request, Response } from 'express';
import * as userService from './users.service';

interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string };
}

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const updates = req.body;
  const currentUser = req.user;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  if (!currentUser) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No data provided for update'
    });
  }

  try {
    if (currentUser.role !== 'admin' && currentUser.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    if (currentUser.role !== 'admin' && updates.role) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update user roles'
      });
    }

    const user = await userService.updateUser(userId, updates);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  try {
    const deleted = await userService.deleteUser(userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};