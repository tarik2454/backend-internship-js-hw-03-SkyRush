import { Types } from "mongoose";
import { AuditLog } from "./models/audit-log.model";
import { AuditAction, EntityType } from "./models/audit-log.types";

interface AuditLogData {
  userId?: Types.ObjectId;
  action: AuditAction;
  entityType: EntityType;
  entityId?: Types.ObjectId | string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

class AuditService {
  async log(data: AuditLogData): Promise<void> {
    try {
      await AuditLog.create({
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        oldValue: data.oldValue,
        newValue: data.newValue,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });
    } catch (error) {
      console.error("Failed to create audit log:", error);
    }
  }

  async getLogs(
    userId?: Types.ObjectId,
    entityType?: EntityType,
    limit = 100,
    offset = 0
  ) {
    const query: Record<string, unknown> = {};

    if (userId) {
      query.userId = userId;
    }

    if (entityType) {
      query.entityType = entityType;
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("userId", "username email")
      .lean();

    const total = await AuditLog.countDocuments(query);

    return {
      logs,
      total,
      limit,
      offset,
    };
  }
}

export default new AuditService();
