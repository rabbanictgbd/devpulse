
export type IssueStatus = "open" | "in_progress" | "closed";

export interface CreateIssueBody {
  title: string;
  description: string;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  status: IssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}
