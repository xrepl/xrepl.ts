# xREPL TypeScript Client - Implementation Roadmap: Phases 9-11

## Current Status
- **Implemented**: 51 operations (61%)
- **Remaining**: 32 operations (39%)
- **Total**: 83 operations

## Completed Phases

- ✅ **Phase 1**: Core REPL - 8 operations (eval, clone, close, ls_sessions, ping, describe, interrupt, load_file)
- ✅ **Phase 2**: Code Intelligence - 8 operations (complete, signature, eldoc, doc, find_definition, find_references, list_definitions, format)
- ✅ **Phase 3**: Compilation & Building - 4 operations (compile_file, compile_project, lint, buffer_analysis)
- ✅ **Phase 4**: CI/CD automation and dual-registry publishing
- ✅ **Phase 5**: Debugging - 7 operations (set_breakpoint, clear_breakpoint, list_breakpoints, stacktrace, step, inspect_locals, eval_in_frame)
- ✅ **Phase 6**: Testing & Refactoring - 6 operations (test_run, test_coverage, test_rerun_failures, rename_symbol, extract_function, inline_function)
- ✅ **Phase 7**: BEAM-Specific - 6 operations (hot_reload, list_processes, inspect_process, trace_calls, system_info, observer_data)
- ✅ **Phase 8**: Advanced Features - 12 operations (macroexpand, macroexpand_all, profile_start, profile_stop, benchmark, workspace_symbols, generate_function, generate_tests, suggest_improvements, snippets, share_session, restore_session)

---

## Phase 9: MUST HAVE (13 operations)
**Priority: Critical - Essential for VSCode extension MVP**

### Session Management (3 operations)
1. **switch_namespace** - Switch module/namespace context
   - Essential for navigating between modules
   - Allows REPL context switching without creating new sessions

2. **session_info** - Get detailed session information
   - Inspect session state, namespace, bindings
   - Critical for debugging and UI display

3. **upload_history** - Sync client history to server
   - Enable persistent history across sessions
   - Support history synchronization in distributed setups

### Code Intelligence (3 operations)
4. **type_info** - Get type information for expressions
   - Type lookups for better IDE integration
   - Essential for VSCode hover and IntelliSense

5. **apropos** - Search symbols by name/documentation
   - Symbol discovery across all loaded modules
   - Critical for exploration and learning

6. **symbol_at_point** - Get symbol information at cursor position
   - Context-aware symbol information
   - Foundation for many IDE features

### Compilation & Building (2 operations)
7. **dependencies** - List project dependencies
   - Project dependency management
   - Required for build tooling integration

8. **build** - Run build command
   - Execute build tasks from IDE
   - Integration with rebar3/mix/etc.

### Evaluation (2 operations)
9. **eval_multiple** - Evaluate multiple forms atomically
   - Batch evaluation for efficiency
   - Essential for loading multiple definitions

10. **cancel** - Cancel in-progress operation
    - Interrupt long-running operations
    - Better than interrupt for specific operations

### Status & Introspection (3 operations)
11. **capabilities** - Get detailed server capabilities
    - Feature negotiation and version compatibility
    - Dynamic UI based on server capabilities

12. **version** - Get version information
    - Server/client version checking
    - Compatibility verification

13. **loaded_modules** - List currently loaded modules
    - Module discovery and navigation
    - Essential for project exploration

**Estimated Timeline**: 2-3 weeks

**Success Criteria**:
- All 13 operations implemented with full type safety
- Comprehensive unit tests (90%+ coverage)
- TSDoc documentation with examples
- Integration tests with mock server
- Ready for VSCode extension MVP

---

## Phase 10: SHOULD HAVE (11 operations)
**Priority: High - Important for good developer experience**

### Enhanced Code Intelligence (4 operations)
1. **complete_context** - Context-aware completion
   - Smarter than basic complete
   - Considers cursor position, imports, scope

2. **eldoc_batch** - Batch eldoc queries for multiple symbols
   - Efficient signature lookup for multiple symbols
   - Reduces round-trips for complex expressions

3. **indent_info** - Get proper indentation information
   - Smart indentation based on context
   - Essential for code formatting

4. **highlight_regions** - Semantic syntax highlighting regions
   - Return semantic token ranges
   - Integration with VSCode semantic highlighting

### Enhanced Evaluation (2 operations)
5. **eval_at_point** - Context-aware evaluation
   - Evaluate based on cursor position
   - Smart form detection and evaluation

6. **stream_eval** / **eval_stream** - Streaming evaluation with live output
   - Real-time output streaming
   - Better UX for long-running evaluations

### Documentation (2 operations)
7. **module_doc** - Get module-level documentation
   - Full module documentation
   - Integration with help systems

8. **search_docs** - Search across documentation
   - Full-text documentation search
   - Find relevant docs quickly

### History & State (2 operations)
9. **history** - Get evaluation history
   - Access command history
   - History replay and inspection

10. **clear_session** - Clear session state without closing
    - Reset session to clean state
    - Keep session alive but clear bindings

### Introspection (1 operation)
11. **module_info** - Get detailed module information
    - Detailed module metadata
    - Function lists, exports, attributes

**Estimated Timeline**: 2 weeks

**Success Criteria**:
- All 11 operations implemented
- Enhanced IDE experience
- Improved performance with batching and streaming
- Better documentation integration

---

## Phase 11: NICE TO HAVE (8 operations)
**Priority: Medium - Enhanced features**

### Advanced Documentation (2 operations)
1. **generate_doc** - AI-generated documentation
   - Auto-generate documentation from code
   - Improve documentation coverage

2. **module_summary** - Generate module summaries
   - High-level module overviews
   - Quick understanding of unfamiliar modules

### Advanced Features (3 operations)
3. **list_macros** - List available macros
   - Macro discovery
   - Understand available macro transformations

4. **search_history** - Search evaluation history
   - Find previous commands quickly
   - Pattern-based history search

5. **expand_snippet** - Expand code snippet templates
   - Template expansion with placeholders
   - Common code pattern insertion

### LSP-Style Notifications (3 operations)
6. **text_document_did_open** - Notify document opened
   - LSP-compatible document lifecycle
   - Server-side document tracking

7. **text_document_did_change** - Notify document changed
   - Incremental document updates
   - Real-time analysis capabilities

8. **text_document_did_close** - Notify document closed
   - Clean up server-side resources
   - Complete document lifecycle management

**Estimated Timeline**: 1-2 weeks

**Success Criteria**:
- All 8 operations implemented
- 100% protocol coverage (83/83 operations)
- Full LSP-style document lifecycle support
- AI-powered documentation features
- Complete feature parity with spec

---

## Implementation Strategy

### Sprint Organization

**Sprint 1-2: Phase 9 (Critical Operations)**
- Week 1: Session Management + Code Intelligence (6 ops)
- Week 2: Build, Evaluation, Status (7 ops)
- Deliverable: MVP-ready client library

**Sprint 3-4: Phase 10 (Enhanced Features)**
- Week 3: Enhanced Intelligence + Evaluation (6 ops)
- Week 4: Documentation + History + Introspection (5 ops)
- Deliverable: Production-ready client library

**Sprint 5-6: Phase 11 (Advanced Features)**
- Week 5: Advanced Docs + Features (5 ops)
- Week 6: LSP Notifications + Polish (3 ops)
- Deliverable: 100% complete protocol implementation

### Development Workflow (per operation)

1. **Read spec** - Study operation in xrepl-unified-spec.md
2. **Define types** - Add request/response types to protocol.ts
3. **Implement operation** - Create operation file
4. **Add to client** - Import and add method to client.ts
5. **Export types** - Export param types from index.ts
6. **Write tests** - Add unit tests
7. **Test manually** - Verify types and compilation
8. **Document** - Ensure TSDoc is complete

### Testing Requirements

Each operation must have:
- ✅ Parameter interface with validation
- ✅ Request/response type definitions
- ✅ Unit tests for parameter validation
- ✅ TSDoc with usage examples
- ✅ Integration with client interface
- ✅ Exported from public API

---

## Technical Debt & Improvements

### During Phase 9-11, also address:

1. **Standardize operation names** - Ensure consistency (underscore vs hyphen)
2. **Error handling** - Comprehensive error types for each operation
3. **Validation utilities** - Shared validation functions
4. **Response parsers** - Helper functions for common response patterns
5. **Streaming support** - Infrastructure for streaming operations
6. **Connection pooling** - For high-concurrency scenarios
7. **Request cancellation** - Proper cleanup for cancelled operations
8. **Type narrowing** - Better discriminated unions for responses

---

## Success Metrics

### Phase 9 Complete
- ✅ 64/83 operations (77% complete)
- ✅ VSCode extension MVP viable
- ✅ Core functionality complete

### Phase 10 Complete
- ✅ 75/83 operations (90% complete)
- ✅ Production-ready quality
- ✅ Enhanced developer experience

### Phase 11 Complete
- ✅ 83/83 operations (100% complete)
- ✅ Full protocol coverage
- ✅ Feature-complete client library
- ✅ 90%+ test coverage
- ✅ Comprehensive documentation
- ✅ Ready for 1.0 release

---

## Estimated Timeline Summary

- **Phase 9 (Must Have)**: 2-3 weeks → 64/83 operations
- **Phase 10 (Should Have)**: 2 weeks → 75/83 operations
- **Phase 11 (Nice to Have)**: 1-2 weeks → 83/83 operations
- **Testing & Polish**: 1 week
- **Total**: 6-8 weeks for 100% completion

---

## Priority Decision Matrix

When time is limited, implement in this order:

**Week 1 Priority (Absolute Must)**:
1. `switch_namespace` - Essential for REPL UX
2. `session_info` - Required for UI state
3. `type_info` - Core IDE feature
4. `cancel` - Critical for UX
5. `capabilities` - Feature negotiation

**Week 2 Priority (High Value)**:
6. `apropos` - Discovery and exploration
7. `symbol_at_point` - IDE integration
8. `loaded_modules` - Navigation
9. `dependencies` - Project management
10. `eval_multiple` - Efficiency

**Week 3+ Priority (Enhanced Experience)**:
11. All remaining Phase 9 operations
12. Phase 10 operations
13. Phase 11 operations

---

## Notes

- All operations follow the same implementation pattern established in Phases 1-8
- Maintain functional programming style with neverthrow Result types
- Zero exceptions - all errors via Result types
- Full TypeScript strict mode compliance
- Comprehensive TSDoc for all public APIs
- Follow existing code organization and naming conventions

**End of Roadmap**
