export const EXAM_FLOW = ["setup", "entry_open", "entry_closed", "calculated", "verified", "sent", "vp_reviewed", "principal_signed", "published"];
export const EXAM_STATUS_LABEL = {
  setup: "Setup", entry_open: "Marks entry open", entry_closed: "Marks entry closed", calculated: "Calculated", verified: "Verified by IT Head",
  sent: "Sent to Principal/VP", vp_reviewed: "Reviewed by VP", principal_signed: "Signed by Principal", published: "Published", board: "Board exam",
};
export const EXAM_STATUS_OPTIONS = [...EXAM_FLOW, "board"].map((value) => ({ value, label: EXAM_STATUS_LABEL[value] }));
