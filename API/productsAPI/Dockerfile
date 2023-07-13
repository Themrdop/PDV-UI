# Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build-env

EXPOSE 80
EXPOSE 443

WORKDIR /app
COPY ./src/ ./

RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app

COPY --from=build-env /app/out .

ENTRYPOINT ["dotnet", "Products.API.dll"]

