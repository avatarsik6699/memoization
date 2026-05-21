{
  "_meta": {
    "format": "SDD CONTEXT.md — Single Source of Truth for AI agent",
    "update_rule": "Append contracts after each phase via /context-update. Never remove existing entries."
  },

  "captured_at": "2026-05-21",
  "phase_completed": "01",
  "phase_in_progress": null,

  "stack": {
    "summary": "See docs/STACK.md for the full set of technologies and version pins."
  },

  "core_models": [
    {
      "name": "StorageAdapter",
      "kind": "frontend-contract",
      "phase": "01",
      "summary": "Local/cloud storage abstraction used by editor and document tree modules; Phase 01 initializes it in local mode."
    },
    {
      "name": "LocalAdapter",
      "kind": "frontend-contract",
      "phase": "01",
      "summary": "Dexie-backed implementation of StorageAdapter for anonymous offline documents."
    },
    {
      "name": "Page",
      "kind": "frontend-type",
      "phase": "01",
      "summary": "Editable document record stored locally and autosaved by the editor."
    },
    {
      "name": "TreeNode",
      "kind": "frontend-type",
      "phase": "01",
      "summary": "Page/folder tree node used for local hierarchy, ordering, selection, and drag/drop."
    },
    {
      "name": "CreateNodeInput",
      "kind": "frontend-type",
      "phase": "01",
      "summary": "Input contract for creating local pages and folders."
    },
    {
      "name": "LocalNode",
      "kind": "indexeddb-model",
      "phase": "01",
      "summary": "Dexie nodes store record for local page/folder metadata."
    },
    {
      "name": "LocalPage",
      "kind": "indexeddb-model",
      "phase": "01",
      "summary": "Dexie pages store record for local document content."
    },
    {
      "name": "LocalUpload",
      "kind": "indexeddb-model",
      "phase": "01",
      "summary": "Dexie uploads store record for anonymous base64 image content."
    },
    {
      "name": "PendingChange",
      "kind": "indexeddb-model",
      "phase": "01",
      "summary": "Dexie pending_changes store record reserved for future migration/sync work."
    },
    {
      "name": "TiptapDocumentJSON",
      "kind": "frontend-type",
      "phase": "01",
      "summary": "Serialized Tiptap document payload persisted by local storage."
    },
    {
      "name": "ThemeMode",
      "kind": "frontend-type",
      "phase": "01",
      "values": ["light", "dark", "system"]
    },
    {
      "name": "LanguageCode",
      "kind": "frontend-type",
      "phase": "01",
      "values": ["ru", "en"]
    }
  ],

  "endpoints_active": [],

  "db_schema": {
    "tables": [],
    "source": null,
    "current_head": null
  },

  "indexeddb_schema": {
    "database": "notesapp_v1",
    "phase": "01",
    "stores": [
      "nodes: id, parentId, type, orderIndex, updatedAt, isDeleted",
      "pages: id, updatedAt",
      "uploads: id, pageId",
      "pending_changes: id, createdAt"
    ]
  },

  "ui_pages_active": [
    {
      "path": "/",
      "phase": "01",
      "summary": "Anonymous offline editor workspace root."
    },
    {
      "path": "/:nodeId",
      "phase": "01",
      "summary": "Anonymous offline editor workspace with a selected local node."
    }
  ],

  "env_config": {
    "keys": []
  },

  "db_seeds": {},

  "notes": "Phase 01 complete. Added the anonymous offline editor workspace, Dexie local persistence, document tree, Tiptap editor, i18n/theme controls, storage visibility, and PWA offline foundation."
}
