use spacetimedb::{table, reducer, Identity, ReducerContext, Timestamp, Table};
use anyhow::{anyhow, Result};

// Admin table - used to track users with admin privileges
#[table(name = admin, public)]
pub struct Admin {
    #[primary_key]
    identity: Identity,
}

// Current status - the latest status of the system
#[table(name = current_status, public)]
pub struct CurrentStatus {
    #[primary_key]
    id: u32,  // We'll use 0 as our singleton ID
    message: String,
    last_updated: Timestamp,
}

// Update log - historical record of all status updates
#[table(name = update_log, public)]
pub struct UpdateLog {
    #[primary_key]
    #[auto_inc]
    update_id: u64,
    message: String,
    timestamp: Timestamp,
}

// User table - track users and their online status
#[table(name = user, public)]
pub struct User {
    #[primary_key]
    identity: Identity,
    name: Option<String>,
    online: bool,
}

// Message table - store chat messages
#[table(name = message, public)]
pub struct Message {
    sender: Identity,
    sent: Timestamp,
    text: String,
}

// Poll system tables
#[table(name = poll, public)]
pub struct Poll {
    #[primary_key]
    #[auto_inc]
    poll_id: u64,
    question: String,
    created_by: Identity,
    created_at: Timestamp,
    expires_at: Option<Timestamp>,
    active: bool,
}

#[table(name = poll_option, public)]
pub struct PollOption {
    #[primary_key]
    #[auto_inc]
    option_id: u64,
    poll_id: u64,
    text: String,
}

#[table(name = poll_vote, public)]
pub struct PollVote {
    #[primary_key]
    #[auto_inc]
    vote_id: u64,
    poll_id: u64,
    option_id: u64,
    voter: Identity,
    voted_at: Timestamp,
}

// Mouse state - comprehensive real-time mouse/interaction tracking for MMO-style webpage
#[table(name = mouse_state, public)]
pub struct MouseState {
    #[primary_key]
    identity: Identity,
    // Basic position
    x: f32,
    y: f32,
    // Click states (for collaborative clicking, drawing, etc.)
    left_button_down: bool,
    right_button_down: bool,
    middle_button_down: bool,
    // Scroll tracking (for synchronized scrolling)
    scroll_x: f32,
    scroll_y: f32,
    // Interaction states (for collaborative interactions)
    is_dragging: bool,
    hovered_element: String, // CSS selector or element ID of what they're hovering
    // Viewport info (essential for different screen sizes in multiplayer)
    viewport_width: f32,
    viewport_height: f32,
    // Activity tracking
    last_updated: Timestamp,
}

// Initialize the database with empty status
#[reducer(init)]
pub fn init(ctx: &ReducerContext) {
    log::info!("Initializing status module...");
    
    // Create initial status
    ctx.db.current_status().insert(CurrentStatus {
        id: 0,
        message: String::from("Status system initialized"),
        last_updated: ctx.timestamp,
    });
}

// Check if a given identity is an admin
fn is_admin(ctx: &ReducerContext) -> bool {
    ctx.db.admin().identity().find(&ctx.sender).is_some()
}

#[reducer]
pub fn update_status(ctx: &ReducerContext, new_status: String) -> Result<(), String> {
    // Only allow admin to update status
    if !is_admin(ctx) {
        return Err("Not authorized to update status".to_string());
    }

    // Update current status
    let mut status = ctx.db.current_status().id().find(&0)
        .ok_or("Status not initialized")?;
    status.message = new_status;
    status.last_updated = ctx.timestamp;
    ctx.db.current_status().id().update(status);

    Ok(())
}

#[reducer]
pub fn add_update(ctx: &ReducerContext, message: String) -> Result<(), String> {
    // Only allow admin to add updates
    if !is_admin(ctx) {
        return Err("Not authorized to add updates".to_string());
    }

    // Add new update to log
    ctx.db.update_log().insert(UpdateLog {
        update_id: 0, // Auto-incremented
        message,
        timestamp: ctx.timestamp,
    });

    Ok(())
}

#[reducer(client_connected)]
pub fn identity_connected(ctx: &ReducerContext) {
    if let Some(user) = ctx.db.user().identity().find(&ctx.sender) {
        // If this is a returning user, i.e. we already have a `User` with this `Identity`,
        // set `online: true`, but leave `name` and `identity` unchanged.
        ctx.db.user().identity().update(User {
            online: true,
            ..user
        });
    } else {
        // If this is a new user, create a `User` row for the `Identity`,
        // which is online, but hasn't set a name.
        ctx.db.user().insert(User {
            name: None,
            identity: ctx.sender,
            online: true,
        });
    }
}

#[reducer(client_disconnected)]
pub fn identity_disconnected(ctx: &ReducerContext) {
    if let Some(user) = ctx.db.user().identity().find(&ctx.sender) {
        ctx.db.user().identity().update(
            User {
                online: false,
                ..user
            },
        );
    } else {
        // This branch should be unreachable,
        // as it doesn't make sense for a client to disconnect without connecting first.
        log::warn!(
            "Disconnect event for unknown user with identity {:?}",
            ctx.sender
        );
    }
}

fn validate_name(name: String) -> Result<String> {
    if name.is_empty() {
        Err(anyhow!("Names must not be empty"))
    } else {
        Ok(name)
    }
}

#[reducer]
pub fn set_name(ctx: &ReducerContext, name: String) -> Result<()> {
    let name = validate_name(name)?;
    if let Some(user) = ctx.db.user().identity().find(&ctx.sender) {
        ctx.db.user().identity().update(
            User {
                name: Some(name),
                ..user
            },
        );
        Ok(())
    } else {
        Err(anyhow!("Cannot set name for unknown user"))
    }
}

fn validate_message(text: String) -> Result<String> {
    if text.is_empty() {
        Err(anyhow!("Messages must not be empty"))
    } else {
        Ok(text)
    }
}

#[reducer]
pub fn send_message(ctx: &ReducerContext, text: String) -> Result<()> {
    // Things to consider:
    // - Rate-limit messages per-user.
    // - Reject messages from unnamed users.
    let text = validate_message(text)?;
    ctx.db.message().insert(Message {
        sender: ctx.sender,
        text,
        sent: ctx.timestamp,
    });
    Ok(())
}

// Update mouse state - real-time mouse/interaction tracking (public access)
#[reducer]
pub fn update_mouse_state(
    ctx: &ReducerContext,
    x: f32,
    y: f32,
    left_button_down: bool,
    right_button_down: bool,
    middle_button_down: bool,
    scroll_x: f32,
    scroll_y: f32,
    is_dragging: bool,
    hovered_element: String,
    viewport_width: f32,
    viewport_height: f32,
) -> Result<()> {
    // Insert or update the mouse state for this user
    // SpacetimeDB will automatically upsert based on the primary key (identity)
    ctx.db.mouse_state().insert(MouseState {
        identity: ctx.sender,
        x,
        y,
        left_button_down,
        right_button_down,
        middle_button_down,
        scroll_x,
        scroll_y,
        is_dragging,
        hovered_element,
        viewport_width,
        viewport_height,
        last_updated: ctx.timestamp,
    });

    Ok(())
}
