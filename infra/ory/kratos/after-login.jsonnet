function(ctx)
if std.startsWith(ctx.identity.traits.email, "test-") then
  error "cancel"
else
  {
    identity: ctx.identity,
  }
