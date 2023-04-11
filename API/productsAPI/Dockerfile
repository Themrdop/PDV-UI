# FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS base
FROM mcr.microsoft.com/dotnet/runtime:6.0.0-focal-arm32v7 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/runtime:6.0.0-focal-arm32v7 AS build
WORKDIR /src
COPY ["./scr/Products.API/Products.API.csproj", "./"]
RUN dotnet restore "./Products.API.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "Products.API.csproj" -c Release -o /app/build -r linux-arm
RUN apt-get update && \
    apt-get install -y wget && \
    apt-get install -y gnupg2 && \
    wget -qO- https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install -y build-essential nodejs

FROM build AS publish
RUN dotnet publish "Products.API.csproj" -c Release -o /app/publish -r linux-arm

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Products.API.dll"]