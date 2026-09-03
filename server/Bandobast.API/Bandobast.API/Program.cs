using Bandobast.API.Data;
using Bandobast.API.Features.Areas;
using Bandobast.API.Features.Notifications;
using Bandobast.API.Features.Outages;
using Bandobast.API.Features.Predictions;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
	options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowFrontend", policy =>
		policy.WithOrigins("http://localhost:3000")
			.AllowAnyMethod()
			.AllowAnyHeader());
});

builder.Services.AddRateLimiter(options =>
{
	options.AddFixedWindowLimiter("OutagePost", opt =>
	{
		opt.PermitLimit = 10;
		opt.Window = TimeSpan.FromMinutes(1);
		opt.QueueLimit = 0;
	});
});

// Domain services
builder.Services.AddScoped<OutageService>();
builder.Services.AddScoped<AreaService>();
builder.Services.AddScoped<PredictionService>();
builder.Services.AddScoped<Bandobast.API.Features.Auth.AuthService>();
builder.Services.AddScoped<Bandobast.API.Features.Users.UserService>();
builder.Services.AddScoped<Bandobast.API.Features.Complaints.ComplaintService>();
builder.Services.AddScoped<Bandobast.API.Features.Admin.AdminService>();
builder.Services.AddScoped<Bandobast.API.Features.Gamification.GamificationService>();

// Notification services
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ISmsProvider, TwilioSmsProvider>();
builder.Services.AddScoped<EmailTemplateService>();
builder.Services.AddScoped<NotificationService>();

// Background retry worker
builder.Services.AddHostedService<NotificationRetryWorker>();

var jwtSettings = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtSettings["Secret"]!))
    };
});
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseRateLimiter();

app.UseExceptionHandler(errorApp =>
{
	errorApp.Run(async context =>
	{
		context.Response.StatusCode = 500;
		context.Response.ContentType = "application/json";

		var feature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
		var exception = feature?.Error;

		var response = new
		{
			message = "An unexpected error occurred.",
			detail = app.Environment.IsDevelopment() ? exception?.Message : null
		};

		await context.Response.WriteAsJsonAsync(response);
	});
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

// Static seeders for test
using (var scope = app.Services.CreateScope())
{
	var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
	try 
	{
		db.Database.Migrate();

		if (!db.Localities.Any())
		{
			db.Localities.AddRange(
				new Locality { Name = "Jamnagar - Bedi Bandar", PinCode = "361001", Latitude = 22.4707, Longitude = 70.0577 },
				new Locality { Name = "Jamnagar - Patel Colony", PinCode = "361008", Latitude = 22.4600, Longitude = 70.0700 },
				new Locality { Name = "Ahmedabad - Navrangpura", PinCode = "380009", Latitude = 23.0359, Longitude = 72.5619 }
			);
			db.SaveChanges();
		}
	}
	catch (Exception ex)
	{
		Console.WriteLine("An error occurred during database migration: " + ex.Message);
	}
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
