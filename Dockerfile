FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the entire repository
COPY . .

# Navigate to the API folder, restore and publish
WORKDIR /src/server/Bandobast.API/Bandobast.API
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

# Build the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Render dynamically assigns a port, but .NET 8 uses 8080 by default
ENV ASPNETCORE_HTTP_PORTS=8080
# Use Workstation GC to prevent memory access violations (Exit Status 139) on tiny Render instances
ENV DOTNET_gcServer=0
EXPOSE 8080

ENTRYPOINT ["dotnet", "Bandobast.API.dll"]
