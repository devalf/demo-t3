import { Injectable, Logger } from '@nestjs/common';

import { UserDto } from '../dto';

type AuthorizationResult = {
  allowed: boolean;
  reason?: string;
};

@Injectable()
export class UserOperationPermissionService {
  private readonly logger = new Logger(UserOperationPermissionService.name);

  /**
   * Checks if the current user has permission to perform actions on the target user.
   * This includes operations like deletion, logout-all, and other administrative actions.
   *
   * Business rules:
   * - Users can perform actions on their own account
   * - Admins can perform actions on any non-admin user
   * - Managers can perform actions on CLIENT users only
   * - Other roles have no special permissions
   */
  canUserPerformActionOnUser(
    currentUser: UserDto,
    targetUser: Partial<UserDto>
  ): AuthorizationResult {
    this.logger.debug(
      `Checking authorization: user ${currentUser.id} (${currentUser.role}) -> target ${targetUser.id} (${targetUser.role})`
    );

    // Self-action: user can perform actions on their own account
    if (currentUser.id === targetUser.id) {
      this.logger.debug('Authorization granted: self-action');

      return { allowed: true };
    }

    // Admin can perform actions on any non-admin user
    if (currentUser.role === 'ADMIN') {
      // Prevent admin from performing actions on other admins (business rule)
      if (targetUser.role === 'ADMIN') {
        this.logger.warn(
          'Authorization denied: admin cannot act on other admins'
        );

        return {
          allowed: false,
          reason: 'Admins cannot perform actions on other admin accounts',
        };
      }

      this.logger.debug('Authorization granted: admin action on non-admin');

      return { allowed: true };
    }

    // Manager can perform actions on CLIENT users only (business rule)
    if (currentUser.role === 'MANAGER' && targetUser.role === 'CLIENT') {
      this.logger.log('Authorization granted: manager action on client');
      return { allowed: true };
    }

    this.logger.warn('Authorization denied: insufficient permissions');

    return {
      allowed: false,
      reason:
        'Insufficient permissions to perform this action on the target user',
    };
  }
}
