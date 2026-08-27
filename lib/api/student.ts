import { BACKEND_URL } from "@/config/api";
import { apiClient as fetch } from "./client";

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch Student Overview progress metrics, recent AI evaluation review, and capstone project tracks
 */
export async function getStudentOverview() {
  try {
    const res = await fetch(`${BACKEND_URL}/student/overview`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("API getStudentOverview error:", error);
    return null;
  }
}

/**
 * Fetch Student Profile info
 */
export async function getStudentProfile() {
  try {
    const res = await fetch(`${BACKEND_URL}/student/profile`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("API getStudentProfile error:", error);
    return null;
  }
}

export async function getStudentWorkspace() {
  try {
    const res = await fetch(`${BACKEND_URL}/student/workspace`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data?.selectedProjects && Array.isArray(data.selectedProjects)) {
      return data.selectedProjects.map((ep: any) => ({
        id: ep.project.id,
        title: ep.project.title,
        description: ep.project.description,
        orderIndex: ep.orderIndex,
        workspaceTemplate: {
          id: ep.workspace?.workspaceTemplateId || ep.project.id,
          version: ep.workspace?.templateVersion || 1,
          tasks: (ep.workspace?.tasks || []).map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            orderIndex: t.orderIndex,
            status: t.progress?.status || "LOCKED",
            resources: t.templateTask?.resources || [],
          })),
        },
      }));
    }

    return null;
  } catch (error) {
    console.error("API getStudentWorkspace error:", error);
    return null;
  }
}

/**
 * Fetch all enrolled programs for logged in student
 */
export async function getStudentPrograms() {
  try {
    const res = await fetch(`${BACKEND_URL}/student/programs`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("API getStudentPrograms error:", error);
    return [];
  }
}

/**
 * Fetch Student Submissions
 */
export async function getStudentSubmissions() {
  try {
    const res = await fetch(`${BACKEND_URL}/student/submissions`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("API getStudentSubmissions error:", error);
    return [];
  }
}

/**
 * Link or Update Project Workspace GitHub Repository URL
 */
export async function updateProjectWorkspaceRepo(workspaceId: number, repoUrl: string) {
  const res = await fetch(`${BACKEND_URL}/student/workspace/${workspaceId}/repo`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ repoUrl }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to update GitHub repository link');
  }

  return await res.json();
}

/**
 * Submit Task Deliverable for a Workspace Step (Commit Hash or Payload URL)
 */
export async function submitStudentTask(
  workspaceTaskId: number,
  submission: string | { commitHash?: string; payloadUrl?: string }
) {
  const bodyPayload =
    typeof submission === 'string'
      ? submission.startsWith('http')
        ? { workspaceTaskId, payloadUrl: submission }
        : { workspaceTaskId, commitHash: submission }
      : { workspaceTaskId, ...submission };

  const res = await fetch(`${BACKEND_URL}/student/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to submit task deliverable');
  }

  return await res.json();
}

/**
 * Fetch Student Rubrics
 */
export async function getStudentRubrics() {
  try {
    const res = await fetch(`${BACKEND_URL}/student/rubrics`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("API getStudentRubrics error:", error);
    return [];
  }
}

/**
 * Fetch Student Certificates
 */
export async function getStudentCertificates() {
  try {
    const res = await fetch(`${BACKEND_URL}/student/certificates`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("API getStudentCertificates error:", error);
    return [];
  }
}
